  import MicroscopeDashboard from "./components/Gallery";
  import Header from "./components/DropDown";
  import OrderingPage from "./components/OrderingPage";
  import ProductsCard from "./components/ProductsCard";
  import { Routes, Route } from "react-router-dom";

  const App = () => {
  return (
    <div>
      <Header />
      <Routes>
        <Route 
          path="/" 
          element={
            <div>
              <OrderingPage/>
              <MicroscopeDashboard/>
            </div>
          } 
        />
        <Route path="/order" element={<OrderingPage />} />
      </Routes>
    </div>
  );
};

export default App;
