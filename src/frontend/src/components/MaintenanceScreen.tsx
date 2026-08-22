import { Wrench } from "lucide-react";

interface MaintenanceScreenProps {
  message: string;
}

export function MaintenanceScreen({ message }: MaintenanceScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-background text-center">
      <div className="h-14 w-14 rounded-2xl bg-amber-500/15 flex items-center justify-center">
        <Wrench className="h-7 w-7 text-amber-600" />
      </div>
      <h1 className="text-lg font-bold text-foreground">
        App Maintenance Mein Hai
      </h1>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
    </div>
  );
}
