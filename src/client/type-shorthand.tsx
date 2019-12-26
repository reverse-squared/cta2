import React, { ChangeEvent } from 'react';

export type StringObject<X> = { [key: string]: X };
export type AnchorClickEvent = React.MouseEvent<HTMLAnchorElement, MouseEvent>;
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
export type TextareaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
