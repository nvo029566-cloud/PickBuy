import { useEffect, useState } from "react";
import api from "../../utils/apiClient.js";
import { useAuth } from "../../context/AuthContext.jsx";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const load = async () => {
    setLoading(true);
    const res = await api.get("/users");
    setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể cập nhật quyền");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa người dùng này?")) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa");
    }
  };

  if (loading) return <p className="status-text">Đang tải người dùng...</p>;

  return (
    <div>
      <h2>Quản lý người dùng</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Vai trò</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone || "-"}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  disabled={u.id === currentUser.id}
                >
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{new Date(u.created_at).toLocaleDateString("vi-VN")}</td>
              <td>
                <button
                  className="admin-btn-danger"
                  onClick={() => handleDelete(u.id)}
                  disabled={u.id === currentUser.id}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
