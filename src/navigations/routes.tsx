import type { ComponentType } from 'react';


import { SignIn } from '../Pages/SignIn/SignIn';
import { Goods } from '../Pages/Goods/Goods';
import { Sales } from '../Pages/Sales/Sales';
import { AddSale } from '../Pages/Sales/AddSale';
import { EditSale } from '../Pages/Sales/EditSale';
import { AddNewGood } from '../Pages/Goods/AddNewGood';
import { EditGood } from '../Pages/Goods/EditGood';
import { Filters } from '../Pages/FiltersSettings/Filters';
import { AddFilter } from '../Pages/FiltersSettings/AddFilter';
import { Carts } from '../Pages/Carts/Carts';
import { CountriesForDelivery } from '../Pages/CountriesForDelivery/CountriesForDelivery';
import { AddCountry } from '../Pages/CountriesForDelivery/addCountry';
import { Orders } from '../Pages/Orders/Orders';
import { Clients } from '../Pages/Clients/Clients';
import { ClientOrder } from '../Pages/Clients/ClientOrder';
import { Settings } from '../Pages/Settings/Settings';
import { Tags } from '../Pages/Settings/Tags';



interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  
}

export const routes: Route[] = [
  { path: '/', Component: SignIn },
  { path: '/goods-page', Component: Goods },
  { path: '/sales-page', Component: Sales },
  { path: '/addsale-page', Component: AddSale },
  { path: '/editsale-page', Component: EditSale },
  { path: '/add_new_good-page', Component: AddNewGood },
  { path: '/edit_good-page', Component: EditGood },
  
  { path: '/filters-page', Component: Filters },
  { path: '/filters_addnew-page', Component: AddFilter },
  
  { path: '/countries-page', Component: CountriesForDelivery },
  { path: '/countries_addnew-page', Component: AddCountry },

  { path: '/clients-page', Component: Clients },
  { path: '/clientorder-page', Component: ClientOrder },

  { path: '/carts-page', Component: Carts },
  
  { path: '/orders-page', Component: Orders },
  
  { path: '/settings-page', Component: Settings },
  { path: '/tags-page', Component: Tags },

//   { path: '/onboarding', Component: Onboarding, title: 'Onboarding' },
  
  
  
];
