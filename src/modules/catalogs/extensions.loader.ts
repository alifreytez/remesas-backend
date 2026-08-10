import { type Router } from 'express';
import { Logger } from '@utils/logger.util.js';
import { ANSI } from '@utils/ansi.util.js';

export const loadCatalogExtensions = async (router: Router): Promise<void> => {
    try {
        // @ts-ignore
        if (typeof import.meta.env !== 'undefined') {
            // Entorno Vite
            // @ts-ignore
            const extensionModules = import.meta.glob('./extensions/*/_.route.{ts,js}', { eager: false });
            
            for (const pathRoute in extensionModules) {
                const moduleName = pathRoute.split('/')[2]; // ./extensions/<moduleName>/_.route.ts
                
                try {
                    const module = (await extensionModules[pathRoute]()) as any;
                    const routeHandler = module.default;
                    
                    if (routeHandler && typeof routeHandler === 'function') {
                        router.use(`/${moduleName}`, routeHandler);
                        Logger.natural(`Loaded Catalog Extension: ${ANSI.link(`/api/v1/catalogs/${moduleName}`)}${ANSI.getCode('reset')}`);
                    }
                } catch (error: any) {
                    Logger.error(`Failed to load catalog extension ${moduleName}:`, error);
                }
            }
        } else {
            // Entorno nativo Node.js sin Vite (ej. Jest)
            const fs = await import('fs');
            const path = await import('path');
            const { fileURLToPath, pathToFileURL } = await import('url');

            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const extensionsPath = path.join(__dirname, 'extensions');

            try {
                fs.accessSync(extensionsPath);
                
                const moduleNames = fs
                    .readdirSync(extensionsPath, { withFileTypes: true })
                    .filter((dirent) => dirent.isDirectory())
                    .map((dirent) => dirent.name);

                for (const moduleName of moduleNames) {
                    const possibleRoutes = [path.join(extensionsPath, moduleName, '_.route.js'), path.join(extensionsPath, moduleName, '_.route.ts')];

                    let routeHandler: any = null;

                    for (const routePath of possibleRoutes) {
                        try {
                            fs.accessSync(routePath);
                            const routeUrl = pathToFileURL(routePath);
                            const module = await import(routeUrl.toString());
                            routeHandler = module.default;
                            break;
                        } catch {
                            // Continuar buscando
                        }
                    }

                    if (routeHandler && typeof routeHandler === 'function') {
                        router.use(`/${moduleName}`, routeHandler);
                        Logger.natural(`Loaded Catalog Extension: ${ANSI.link(`/api/v1/catalogs/${moduleName}`)}${ANSI.getCode('reset')}`);
                    }
                }
            } catch {
                // La carpeta extensions no existe, no hay problema
            }
        }
    } catch (error: any) {
        Logger.error('Failed to load catalog extensions', error);
    }
};
