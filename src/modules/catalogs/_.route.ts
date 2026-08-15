import { Router } from 'express';
import catalogsController from './_.controller.js';
import { verifySession, optionalAuth, verifyPermission } from '@middlewares/auth.middleware.js';
import { loadCatalogExtensions } from './extensions.loader.js';

const router = Router();

// Carga dinámica de extensiones de catálogos (rutas customizadas para catálogos específicos)
await loadCatalogExtensions(router);

// Se añade verifySession a todas las rutas de config ya que requieren permisos
router.get('/', verifySession, verifyPermission('API:VIEW:CONFIGS'), catalogsController.listAllCatalogs);
router.get('/:catalogName/metadata', verifySession, verifyPermission('API:VIEW:CONFIGS'), catalogsController.getMetadata);
router.get('/:catalogName', verifySession, verifyPermission('API:VIEW:CONFIGS'), catalogsController.list);
router.get('/:catalogName/:id', verifySession, verifyPermission('API:VIEW:CONFIGS'), catalogsController.getById);
router.post('/:catalogName', verifySession, verifyPermission('API:CREATE:CONFIGS'), catalogsController.create);
router.patch('/:catalogName/:id', verifySession, verifyPermission('API:UPDATE:CONFIGS'), catalogsController.update);
router.delete('/:catalogName/:id', verifySession, verifyPermission('API:DELETE:CONFIGS'), catalogsController.remove);
router.patch('/:catalogName/:id/restore', verifySession, verifyPermission('API:UPDATE:CONFIGS'), catalogsController.restore);

export default router;
