import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator } from "lucide-react";
import { APP_NAME, APP_VERSION } from "../config/appConfig";

interface AboutPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export function AboutPanel({ open, onOpenChange }: AboutPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>About</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="about" className="w-full mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="about" className="flex-1">
              About
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1">
              Privacy Policy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-4 space-y-4 pb-6">
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Calculator className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold">{APP_NAME}</h3>
              <p className="text-xs text-muted-foreground">
                Version {APP_VERSION}
              </p>
            </div>
            <p className="text-sm text-muted-foreground text-center px-2">
              A complete calculator app — Basic, Scientific, Programmer,
              Finance, Graphing, and AI-assisted math solving, all in one
              clean, private, offline-first tool.
            </p>
            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
              Built for school through engineering-level math and science.
            </div>
          </TabsContent>

          <TabsContent
            value="privacy"
            className="mt-4 space-y-3 text-sm text-muted-foreground pb-6"
          >
            <p>
              {APP_NAME} is built to keep your data on your device.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">
                What we store
              </h4>
              <p>
                Your calculation history, favorites, settings, and admin PIN
                are all saved locally on this device only, using browser
                storage. Nothing is uploaded to any server.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">
                What we don't do
              </h4>
              <p>
                We don't collect analytics, don't track you across apps or
                websites, and don't share any data with third parties —
                because none is ever sent anywhere.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">
                Clearing your data
              </h4>
              <p>
                You can clear history, favorites, or reset your admin PIN
                any time from Settings. Uninstalling the app / clearing site
                data removes everything permanently.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
