param(
  [int]$Year = 2026,
  [int]$FromMonth = 5,
  [int]$ToMonth = 9
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Web

$letterboxdRss = 'https://letterboxd.com/madscientist4/rss/'
$goodreadsRss = 'https://www.goodreads.com/review/list_rss/92395148?shelf=read'
$outputDirectory = Join-Path $PSScriptRoot '..\content\hobby\monthly'

function ConvertFrom-ReviewHtml([string]$value) {
  if ([string]::IsNullOrWhiteSpace($value) -or $value.Trim() -eq 'TBD') {
    return ''
  }

  $cleaned = [regex]::Replace($value, '<p><img[^>]*></p>', '')
  $cleaned = $cleaned -replace '</p>\s*<p>', "`n`n"
  $cleaned = $cleaned -replace '<br\s*/?>', "`n"
  $cleaned = [regex]::Replace($cleaned, '<[^>]+>', '')
  $cleaned = [System.Web.HttpUtility]::HtmlDecode($cleaned).Trim()
  if ($cleaned -eq 'TBD') {
    return ''
  }
  return $cleaned
}

function ConvertTo-Stars([double]$rating) {
  $fullStars = [math]::Floor($rating)
  $stars = '★' * $fullStars
  if ($rating - $fullStars -ge 0.5) {
    $stars += '½'
  }
  return $stars
}

function Get-Excerpt([string]$review) {
  if ([string]::IsNullOrWhiteSpace($review)) {
    return ''
  }

  $firstParagraph = ($review -split "`n`n", 2)[0].Trim()
  if ($firstParagraph.Length -le 180) {
    return $firstParagraph
  }
  return $firstParagraph.Substring(0, 180).TrimEnd() + '…'
}

function New-HobbyEntry(
  [string]$name,
  [string]$date,
  [double]$rating,
  [string]$verb,
  [string]$review
) {
  $prefix = "$date $verb，$(ConvertTo-Stars $rating)。"
  $excerpt = Get-Excerpt $review
  $why = if ($excerpt) { "$prefix $excerpt" } else { $prefix }
  $fullWhy = if ($review) { "$prefix $review" } else { $prefix }

  return [ordered]@{
    name = $name
    why = $why
    fullWhy = $fullWhy
  }
}

$monthly = [ordered]@{}
for ($month = $FromMonth; $month -le $ToMonth; $month++) {
  $key = '{0:D4}-{1:D2}' -f $Year, $month
  $monthly[$key] = [ordered]@{
    month = $key
    books = [System.Collections.Generic.List[object]]::new()
    films = [System.Collections.Generic.List[object]]::new()
  }
}

$goodreads = [xml](Invoke-WebRequest -UseBasicParsing -Uri $goodreadsRss -TimeoutSec 30).Content
foreach ($item in $goodreads.SelectNodes('/rss/channel/item')) {
  $rawDate = $item.SelectSingleNode('user_read_at').InnerText
  if (-not $rawDate) {
    continue
  }

  $readAt = [datetime]::Parse($rawDate)
  $monthKey = $readAt.ToString('yyyy-MM')
  if (-not $monthly.Contains($monthKey)) {
    continue
  }

  $title = $item.SelectSingleNode('title').InnerText.Trim()
  $rating = [double]$item.SelectSingleNode('user_rating').InnerText
  $review = ConvertFrom-ReviewHtml $item.SelectSingleNode('user_review').InnerText
  $entry = New-HobbyEntry "《$title》" $readAt.ToString('yyyy-MM-dd') $rating '读完' $review
  $monthly[$monthKey].books.Add($entry)
}

$letterboxd = [xml](Invoke-WebRequest -UseBasicParsing -Uri $letterboxdRss -TimeoutSec 30).Content
$namespaceManager = [System.Xml.XmlNamespaceManager]::new($letterboxd.NameTable)
$namespaceManager.AddNamespace('letterboxd', 'https://letterboxd.com')

foreach ($item in $letterboxd.SelectNodes('/rss/channel/item')) {
  $watchedDate = $item.SelectSingleNode('letterboxd:watchedDate', $namespaceManager).InnerText
  if (-not $watchedDate) {
    continue
  }

  $monthKey = $watchedDate.Substring(0, 7)
  if (-not $monthly.Contains($monthKey)) {
    continue
  }

  $title = $item.SelectSingleNode('letterboxd:filmTitle', $namespaceManager).InnerText.Trim()
  $rating = [double]$item.SelectSingleNode('letterboxd:memberRating', $namespaceManager).InnerText
  $isRewatch = $item.SelectSingleNode('letterboxd:rewatch', $namespaceManager).InnerText -eq 'Yes'
  $review = ConvertFrom-ReviewHtml $item.SelectSingleNode('description').InnerText
  $verb = if ($isRewatch) { '重看' } else { '观看' }
  $entry = New-HobbyEntry $title $watchedDate $rating $verb $review
  $monthly[$monthKey].films.Add($entry)
}

foreach ($monthKey in $monthly.Keys) {
  $payload = $monthly[$monthKey]
  $payload.books = @($payload.books | Sort-Object { $_.fullWhy.Substring(0, 10) } -Descending)
  $payload.films = @($payload.films | Sort-Object { $_.fullWhy.Substring(0, 10) } -Descending)
  $json = $payload | ConvertTo-Json -Depth 6
  $path = Join-Path $outputDirectory "$monthKey.json"
  Set-Content -LiteralPath $path -Value $json -Encoding utf8
  Write-Output "$monthKey books=$($payload.books.Count) films=$($payload.films.Count)"
}
