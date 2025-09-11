import { Routes } from '@angular/router';
import {SplashComponent} from './features/splash/splash';
import {ScannerComponent} from './features/scanner/scanner';
import {ProductsComponent} from './features/products/products';


export const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'scan', component: ScannerComponent },
  { path: 'products', component: ProductsComponent },
  { path: '**', redirectTo: '' },
];
