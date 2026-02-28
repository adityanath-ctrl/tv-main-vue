import type MenuFeatureItem from './menuFeatureType'
import type Category from './menuCategoryType'
import type SubMenuItem from './menuSubType'

export default interface SideMenuType {
  id: number
  position: number
  menuType: string
  menuItemLayout: string
  menuItemName: string
  icon_url: string
  menuItemColour: string

  featured_items: Array<MenuFeatureItem>
  categories: Array<Category>
  sub_menu_items: Array<SubMenuItem>
}

export default interface SideMenuTypes {
  SideMenuTypes: Array<SideMenuType>
}
