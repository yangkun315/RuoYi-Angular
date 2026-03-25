// Custom icon static resources

import {
  AppstoreOutline,
  CheckSquareOutline,
  CloudUploadOutline,
  MessageOutline,
  MinusOutline,
  SendOutline,
  StarOutline,
} from '@ant-design/icons-angular/icons';

/** minus、cloud-upload 不在 ng-zorro 内置 NZ_ICONS_USED_BY_ZORRO 与 style-icons-auto 中，需手动注册；通知页用到的图标一并注册 */
export const ICONS = [
  AppstoreOutline,
  CheckSquareOutline,
  CloudUploadOutline,
  MessageOutline,
  MinusOutline,
  SendOutline,
  StarOutline,
];
