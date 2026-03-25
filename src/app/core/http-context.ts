import { HttpContextToken } from '@angular/common/http';

/** 是否携带 Token，默认 true */
export const IS_TOKEN = new HttpContextToken<boolean>(() => true);

/** 是否防重复提交，默认 true（仅对 POST/PUT） */
export const REPEAT_SUBMIT = new HttpContextToken<boolean>(() => true);
