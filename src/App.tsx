import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { GenerateQuote } from './pages/GenerateQuote';
import { PresetValues } from './pages/PresetValues';
import { Catalog } from './pages/Catalog';
import { Quotes } from './pages/Quotes';
import { QuoteTemplate } from './pages/QuoteTemplate';
import { QuoteView } from './pages/QuoteView';
import { QuoteEdit } from './pages/QuoteEdit';
import { Login } from './pages/Login';
import { ClientQuoteView } from './pages/ClientQuoteView';
import { NotFound } from './pages/NotFound';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { OrderEdit } from './pages/OrderEdit';
import { ReceiptTemplate } from './pages/ReceiptTemplate';
import { DbStatus } from './pages/DbStatus';

export function App() {
  return (
    <Router>
      <Routes>
        {/* Client Quote View - No Layout */}
        <Route path="/client/quote/:id" element={<ClientQuoteView />} />
        <Route path="/404" element={<NotFound />} />
        
        {/* Admin Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="generate-quote" element={<GenerateQuote />} />
          <Route path="preset-values" element={<PresetValues />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="orders/:id/edit" element={<OrderEdit />} />
          <Route path="receipt-template" element={<ReceiptTemplate />} />
          <Route path="quotes/:id/view" element={<QuoteView />} />
          <Route path="quotes/:id/edit" element={<QuoteEdit />} />
          <Route path="quote-template" element={<QuoteTemplate />} />
          <Route path="login" element={<Login />} />
          <Route path="db-status" element={<DbStatus />} />
        </Route>
      </Routes>
    </Router>
  );
}