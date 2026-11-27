// HOAN_THIEN: dựng bố cục trang và khai báo các route theo đề (Mục 4.1, 4.2, 4.3).
// Xoá đoạn return bên dưới khi bắt đầu làm bài.

import ProductTable from "./components/ProductTable";
import ProductFormPage from "./pages/ProductFormPage";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api/axiosClient";
import { useLocation, useNavigate } from "react-router-dom";
import ProductFormPage from "./pages/ProductFormPage";

export default function App() {
  return (
    <div>
      <header className="app-header">OfficeMart Admin</header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
        </Routes>
      </main>
    </div>
  );
}

function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(location.state?.toast || "");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/products", {
        params: { page: 1, limit: 10 },
      });
      setData(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Lỗi không xác định",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleConfirmDelete() {
    if (!deleting) return;
    try {
      await api.delete(`/products/${deleting.id}`);
      setData((prev) => prev.filter((p) => p.id !== deleting.id));
      setDeleting(null);
      setToast("Đã xoá sản phẩm");
    } catch (err) {
      setDeleting(null);
      setError(err.response?.data?.message || "Xoá thất bại");
    }
  }
  return (
    <>
      <div className="page-header">
        <h1>Sản phẩm</h1>
        <button
          type="button"
          data-testid="add-button"
          className="add-button"
          onClick={() => navigate("/products/new")}
        >
          Thêm sản phẩm
        </button>
      </div>
      {toast && <div data-testid="toast" className="toast">{toast}</div>}
      {loading && <div data-testid="loading" className="loading">Đang tải dữ liệu...</div>}
      {!loading && error && (
        <div data-testid="error-message">
          <p>{error}</p>
          <button type="button" data-testid="retry-button" onClick={loadData}>
            Thử lại
          </button>
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <div data-testid="empty-state">Không có sản phẩm nào.</div>
      )}
      {!loading && !error && data.length > 0 && (
        <ProductTable
          products={data}
          onEdit={(p) => navigate(`/products/${p.id}/edit`)}
          onDelete={(p) => setDeleting(p)}
        />
      )}
      {deleting && (
        <div data-testid="confirm-dialog">
          <p>
            Bạn có chắc muốn xoá <strong>{deleting.name}</strong>?
          </p>
          <button type="button" data-testid="confirm-no" onClick={() => setDeleting(null)}>
            Huỷ
          </button>
          <button type="button" data-testid="confirm-yes" onClick={handleConfirmDelete}>
            Đồng ý
          </button>
        </div>
      )}
    </>
  );
}
