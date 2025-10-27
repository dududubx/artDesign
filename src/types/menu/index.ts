export interface MenuFormData {
  id?: number
  parent_id?: string
  type?: number
  name: string
  route_path?: string
  perms?: string
  component_path?: string
  icon?: string
  status?: number
  sort?: number
  is_cache?: number
  is_hidden?: number
  is_hide_tag?: number
  link?: string
  is_iframe?: number
  is_badge?: number
  badge_content?: string
  is_fixes_tag?: number
  children?: MenuFormData[]
  path?: string
  meta?: {
    title?: string
    badge_content?: string
    icon?: string
    is_cache?: number
    is_hidden?: number
    is_hide_tag?: number
    link?: string
    is_iframe?: number
    is_badge?: number
    is_fixes_tag?: number
  }
}
