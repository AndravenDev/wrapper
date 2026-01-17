import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import CreateEvent from './Pages/Create/CreateEvent.tsx';
import Home from './Pages/Home/Home.tsx';
import Summary from './Pages/Summary/Summary.tsx';
import Layout from './components/Layout/Layout.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "createEvent",
        element: <CreateEvent />
      },
      {
        path: "summary",
        element: <Summary />
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
