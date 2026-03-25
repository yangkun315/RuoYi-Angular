export interface RouterVo {
  name?: string;
  path?: string;
  hidden?: boolean;
  redirect?: string;
  component?: string;
  query?: string;
  alwaysShow?: boolean;
  meta?: { title?: string; icon?: string; noCache?: boolean; link?: string };
  children?: RouterVo[];
}
