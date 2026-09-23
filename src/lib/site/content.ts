import 'server-only'

import navigationData from '../../../content/site/navigation.json'
import homepageData from '../../../content/site/homepage.json'
import profileData from '../../../content/site/profile.json'
import contactData from '../../../content/site/contact.json'
import {
  contactSchema,
  homepageSchema,
  navigationSchema,
  profileSchema,
} from '@/lib/content/schemas'
import type {
  ContactInfo,
  HomepageContent,
  NavigationItem,
  ProfileContent,
} from '@/lib/site/types'

function sortNavigation(items: NavigationItem[]) {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      ...item,
      children: item.children
        ? [...item.children].sort((a, b) => a.order - b.order)
        : undefined,
    }))
}

const navigation = sortNavigation(
  navigationSchema.parse(navigationData) as NavigationItem[],
)
const homepage = homepageSchema.parse(homepageData)
const profile = profileSchema.parse(profileData)
const contact = contactSchema.parse(contactData)

export function getHeaderNavigation(): NavigationItem[] {
  return navigation
    .filter((item) => item.showInHeader)
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.showInHeader),
    }))
}

export function getFooterNavigation(): NavigationItem[] {
  return navigation
    .filter((item) => item.showInFooter)
    .map((item) => ({
      ...item,
      children: item.children
        ?.filter((child) => child.showInFooter)
        .sort(
          (a, b) =>
            (a.footerOrder ?? a.order) - (b.footerOrder ?? b.order),
        ),
    }))
}

export function getAllNavigation(): NavigationItem[] {
  return navigation
}

export function getHomepageContent(): HomepageContent {
  return homepage
}

export function getProfileContent(): ProfileContent {
  return profile
}

export function getContactInfo(): ContactInfo {
  return {
    ...contact,
    email: profile.email,
    wechat: profile.socials.wechat,
  }
}
