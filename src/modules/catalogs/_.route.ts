import { Router } from 'express';
import catalogsController from './_.controller.js';
import { verifySession, optionalAuth } from '@middlewares/auth.middleware.js';
import { loadCatalogExtensions } from './extensions.loader.js';

const router = Router();

// Carga dinámica de extensiones de catálogos (rutas customizadas para catálogos específicos)
await loadCatalogExtensions(router);

router.get('/', verifySession, catalogsController.listAllCatalogs);
router.get('/:catalogName/metadata', optionalAuth, catalogsController.getMetadata);
router.get('/:catalogName', optionalAuth, catalogsController.list);
router.get('/:catalogName/:id', optionalAuth, catalogsController.getById);
router.post('/:catalogName', verifySession, catalogsController.create);
router.patch('/:catalogName/:id', verifySession, catalogsController.update);
router.delete('/:catalogName/:id', verifySession, catalogsController.remove);
router.patch('/:catalogName/:id/restore', verifySession, catalogsController.restore);

export default router;
