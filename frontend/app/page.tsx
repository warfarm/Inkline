import { InteractiveReader } from "@/components/interactive-reader";
import { Language } from "@/lib/types";

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center p-8">
            <InteractiveReader
                text="你好世界！这是一个交互式阅读器的示例文本。"
                language={Language.Chinese}
                className="max-w-2xl text-2xl"
            />
        </div>
    );
}
