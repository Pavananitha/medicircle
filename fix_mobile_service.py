import re

filepath = 'mobile/services/adherence.service.ts'
with open(filepath, 'r') as f:
    content = f.read()

serv_old = """  async markAsRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  },"""

serv_new = """  async markAsRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },"""

content = content.replace(serv_old, serv_new)

with open(filepath, 'w') as f:
    f.write(content)
