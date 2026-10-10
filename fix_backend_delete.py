import re

# 1. Update Repository
repo_path = 'server/src/repositories/notification.repository.ts'
with open(repo_path, 'r') as f:
    repo = f.read()

repo_method = """  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, user_id: userId },
      data: { is_read: true },
    });
  }

  async deleteNotification(id: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id, user_id: userId },
    });
  }"""
repo = repo.replace("""  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, user_id: userId },
      data: { is_read: true },
    });
  }""", repo_method)

with open(repo_path, 'w') as f:
    f.write(repo)

# 2. Update Service
serv_path = 'server/src/services/notification.service.ts'
with open(serv_path, 'r') as f:
    serv = f.read()

serv_method = """  async markAsRead(notificationId: string, userId: string) {
    return notificationRepository.markAsRead(notificationId, userId);
  }

  async deleteNotification(notificationId: string, userId: string) {
    return notificationRepository.deleteNotification(notificationId, userId);
  }"""
serv = serv.replace("""  async markAsRead(notificationId: string, userId: string) {
    return notificationRepository.markAsRead(notificationId, userId);
  }""", serv_method)

with open(serv_path, 'w') as f:
    f.write(serv)

# 3. Update Controller
ctrl_path = 'server/src/controllers/notification.controller.ts'
with open(ctrl_path, 'r') as f:
    ctrl = f.read()

ctrl_method = """  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id, req.user!.id);
      return sendSuccess(res, { success: true });
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await notificationService.deleteNotification(id, req.user!.id);
      return sendSuccess(res, { success: true });
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }"""
ctrl = ctrl.replace("""  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id, req.user!.id);
      return sendSuccess(res, { success: true });
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }""", ctrl_method)

with open(ctrl_path, 'w') as f:
    f.write(ctrl)

# 4. Update Routes
routes_path = 'server/src/routes/notification.routes.ts'
with open(routes_path, 'r') as f:
    routes = f.read()

routes_new = """router.get('/notifications', (req, res) => notificationController.getNotifications(req, res));
router.put('/notifications/:id/read', (req, res) => notificationController.markAsRead(req, res));
router.delete('/notifications/:id', (req, res) => notificationController.deleteNotification(req, res));
router.post('/devices/register', (req, res) => notificationController.registerDevice(req, res));"""

routes = routes.replace("""router.get('/notifications', (req, res) => notificationController.getNotifications(req, res));
router.put('/notifications/:id/read', (req, res) => notificationController.markAsRead(req, res));
router.post('/devices/register', (req, res) => notificationController.registerDevice(req, res));""", routes_new)

with open(routes_path, 'w') as f:
    f.write(routes)

