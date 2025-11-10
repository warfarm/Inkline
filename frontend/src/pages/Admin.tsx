import { Layout } from '@/components/layout/Layout';
import { PreloadDefinitions } from '@/components/admin/PreloadDefinitions';

export default function Admin() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Tools</h1>
          <p className="text-muted-foreground mt-2">
            Administrative utilities for managing the application
          </p>
        </div>

        <PreloadDefinitions />
      </div>
    </Layout>
  );
}
