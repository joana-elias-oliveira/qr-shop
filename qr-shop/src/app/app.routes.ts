import { Routes } from '@angular/router';
import {ScannerComponent} from './features/scanner/scanner';
import {ProductsComponent} from './features/products/products';
import {LandingComponent} from './features/landing/landing';


export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'scan', component: ScannerComponent },
  { path: 'products', component: ProductsComponent },
  { path: '**', redirectTo: '' },
];
