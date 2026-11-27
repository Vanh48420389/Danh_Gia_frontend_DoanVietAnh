import { categoryNames } from '../data/sample';

export default function ProductRow({ product, onEdit, onDelete }) {
  const gia = new Intl.NumberFormat('vi-VN').format(product.price) + ' ₫';

  return (
    <tr data-testid="product-row">
      <td data-label="Tên">{product.name}</td>
      <td data-label="SKU">{product.sku}</td>
      <td data-label="Danh mục">{categoryNames[product.category]}</td>
      <td data-label="Giá">{gia}</td>
      <td data-label="Tồn kho">
        {product.stock === 0
          ? <span style={{ color: 'red' }}>Hết hàng</span>
          : product.stock}
      </td>
      <td data-label="Trạng thái">
        <span data-testid="product-status"
          style={{ background: product.status === 'active' ? '#dcfce7' : '#f3f4f6' }}>
          {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
        </span>
      </td>
      <td data-label="Thao tác">
        <button type="button" data-testid="edit-button" className='edit-button' onClick={() => onEdit?.(product)}>
          Sửa
        </button>
        <button type="button" data-testid="delete-button" className='delete-button' onClick={() => onDelete?.(product)}>
          Xoá
        </button>
      </td>
    </tr>
  );
}