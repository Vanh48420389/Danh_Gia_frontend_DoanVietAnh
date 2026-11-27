import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosClient';

const FORM_RONG = {
  name: '',
  sku: '',
  category: '',
  price: '',
  stock: '',
  status: 'active',
};

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(FORM_RONG);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          name: p.name ?? '',
          sku: p.sku ?? '',
          category: p.category ?? '',
          price: p.price ?? '',
          stock: p.stock ?? '',
          status: p.status ?? 'active',
        });
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      });
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const e = {};
    const trimmedName = form.name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 100) {
      e.name = 'Tên từ 3 đến 100 ký tự';
    }
    if (!/^[A-Z]{3}-\d{4}$/.test(form.sku.trim())) {
      e.sku = 'SKU phải đúng dạng ABC-1234';
    }
    if (!form.category) {
      e.category = 'Vui lòng chọn danh mục';
    }
    if (form.price === '' || Number(form.price) <= 0) {
      e.price = 'Giá phải lớn hơn 0';
    }
    const stockNum = Number(form.stock);
    if (form.stock === '' || !Number.isInteger(stockNum) || stockNum < 0) {
      e.stock = 'Tồn kho phải là số nguyên không âm';
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      status: form.status,
    };

    try {
      if (id) {
        await api.put(`/products/${id}`, payload);
        navigate('/products', { state: { toast: 'Đã cập nhật sản phẩm' } });
      } else {
        await api.post('/products', payload);
        navigate('/products', { state: { toast: 'Đã thêm sản phẩm' } });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors((prev) => ({
          ...prev,
          sku: err.response.data?.message || 'SKU đã tồn tại',
        }));
      }
    } finally {
      setSaving(false);
    }
  }

  if (notFound) return <p>Không tìm thấy sản phẩm</p>;

  return (
    <form data-testid="product-form" onSubmit={handleSubmit}>
      <h1>{id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>

      <div>
        <label htmlFor="name">Tên</label>
        <input id="name" name="name" value={form.name} onChange={handleChange} />
        {errors.name && <p data-testid="field-error-name">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="sku">SKU</label>
        <input id="sku" name="sku" value={form.sku} onChange={handleChange} placeholder="VD: KEY-0001" />
        {errors.sku && <p data-testid="field-error-sku">{errors.sku}</p>}
      </div>

      <div>
        <label htmlFor="category">Danh mục</label>
        <select id="category" name="category" value={form.category} onChange={handleChange}>
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category && <p data-testid="field-error-category">{errors.category}</p>}
      </div>

      <div>
        <label htmlFor="price">Giá</label>
        <input id="price" name="price" type="number" value={form.price} onChange={handleChange} />
        {errors.price && <p data-testid="field-error-price">{errors.price}</p>}
      </div>

      <div>
        <label htmlFor="stock">Tồn kho</label>
        <input id="stock" name="stock" type="number" value={form.stock} onChange={handleChange} />
        {errors.stock && <p data-testid="field-error-stock">{errors.stock}</p>}
      </div>

      <div>
        <label htmlFor="status">Trạng thái</label>
        <select id="status" name="status" value={form.status} onChange={handleChange}>
          <option value="active">Đang bán</option>
          <option value="inactive">Ngừng bán</option>
        </select>
      </div>

      <div>
        <button type="button" onClick={() => navigate('/products')}>
          Huỷ
        </button>
        <button type="submit" data-testid="submit-button" disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}