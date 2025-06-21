import type { ComponentType } from 'react';


import { SignIn } from '../Pages/SignIn/SignIn';
import { Goods } from '../Pages/Goods/Goods';
import { Sales } from '../Pages/Sales/Sales';
import { AddNewGood } from '../Pages/Goods/AddNewGood';
import { EditGood } from '../Pages/Goods/EditGood';
import { Filters } from '../Pages/FiltersSettings/Filters';
import { AddFilter } from '../Pages/FiltersSettings/AddFilter';



interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  
}

export const routes: Route[] = [
  { path: '/', Component: SignIn },
  { path: '/goods-page', Component: Goods },
  { path: '/sales-page', Component: Sales },
  { path: '/add_new_good-page', Component: AddNewGood },
  { path: '/edit_good-page', Component: EditGood },
  
  { path: '/filters-page', Component: Filters },
  { path: '/filters_addnew-page', Component: AddFilter },
//   { path: '/onboarding', Component: Onboarding, title: 'Onboarding' },
  
  
  
];
