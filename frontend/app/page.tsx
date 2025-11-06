import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <h1 className="text-2xl font-semibold">Hello World</h1>
        </CardContent>
      </Card>
    </div>
  );
}
