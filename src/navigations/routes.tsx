import type { ComponentType, JSX } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';

import { SignIn } from '../Pages/SignIn/SignIn';
import { Goods } from '../Pages/Goods/Goods';
import { Sales } from '../Pages/Sales/Sales';
import { AddSale } from '../Pages/Sales/AddSale';
import { EditSale } from '../Pages/Sales/EditSale';
import { AddNewGood } from '../Pages/Goods/AddNewGood';
import { EditGood } from '../Pages/Goods/EditGood';
import { Filters } from '../Pages/FiltersSettings/Filters';
import { Carts } from '../Pages/Carts/Carts';
import { CountriesForDelivery } from '../Pages/CountriesForDelivery/CountriesForDelivery';
import { Orders } from '../Pages/Orders/Orders';
import { Clients } from '../Pages/Clients/Clients';
import { ClientOrder } from '../Pages/Clients/ClientOrder';
import { Promocodes } from '../Pages/Promocodes/Promocodes';
import { AddNewPromoCode } from '../Pages/Promocodes/AddNewPromoCode';
import { AddNewPersonalPromoCode } from '../Pages/Promocodes/AddNewPersonalPromoCode';
import { Settings } from '../Pages/Settings/Settings';
import { AdminsList } from '../Pages/Settings/AdminsList';
import { Tags } from '../Pages/Settings/Tags';
import { Statistic } from '../Pages/Statistic/Statistic';
import { RouterStatistic } from '../Pages/Statistic/RouterStatistic';
import { GoodsStatistic } from '../Pages/Statistic/GoodsStatistic';



interface Route {
  path: string;
  Component?: ComponentType;
  title?: string;
  element?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: SignIn },
  { path: '/signin', Component: SignIn },
  { path: '/goods-page', element: <ProtectedRoute><Goods /></ProtectedRoute> },
  { path: '/sales-page', element: <ProtectedRoute><Sales /></ProtectedRoute> },
  { path: '/addsale-page', element: <ProtectedRoute><AddSale /></ProtectedRoute> },
  { path: '/editsale-page', element: <ProtectedRoute><EditSale /></ProtectedRoute> },
  { path: '/add_new_good-page', element: <ProtectedRoute><AddNewGood /></ProtectedRoute> },
  { path: '/edit_good-page', element: <ProtectedRoute><EditGood /></ProtectedRoute> },
  
  { path: '/filters-page', element: <ProtectedRoute><Filters /></ProtectedRoute> },
  
  { path: '/countries-page', element: <ProtectedRoute><CountriesForDelivery /></ProtectedRoute> },

  { path: '/clients-page', element: <ProtectedRoute><Clients /></ProtectedRoute> },
  { path: '/clientorder-page', element: <ProtectedRoute><ClientOrder /></ProtectedRoute> },

  { path: '/carts-page', element: <ProtectedRoute><Carts /></ProtectedRoute> },
  
  { path: '/orders-page', element: <ProtectedRoute><Orders /></ProtectedRoute> },
  
  { path: '/promocodes-page', element: <ProtectedRoute><Promocodes /></ProtectedRoute> },
  { path: '/add_new_promocode-page', element: <ProtectedRoute><AddNewPromoCode /></ProtectedRoute> },
  { path: '/add_new_personal_promocode-page', element: <ProtectedRoute><AddNewPersonalPromoCode /></ProtectedRoute> },

  { path: '/settings-page', element: <ProtectedRoute><Settings /></ProtectedRoute> },
  { path: '/tags-page', element: <ProtectedRoute><Tags /></ProtectedRoute> },
  { path: '/adminslist-page', element: <ProtectedRoute><AdminsList /></ProtectedRoute> },
  
  { path: '/router_statistic-page', element: <ProtectedRoute><RouterStatistic /></ProtectedRoute> },
  { path: '/statistic-page', element: <ProtectedRoute><Statistic /></ProtectedRoute> },
  { path: '/goods_statistic-page', element: <ProtectedRoute><GoodsStatistic /></ProtectedRoute> },
];
