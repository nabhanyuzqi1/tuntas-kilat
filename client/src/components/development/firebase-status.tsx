import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isFirebaseAvailable } from "@shared/firebase-config";

export default function FirebaseStatus() {
  if (isFirebaseAvailable) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          Firebase connection active - All features available
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        Development Mode: Firebase config needed for full functionality. 
        Contact admin for API keys to enable real-time features.
      </AlertDescription>
    </Alert>
  );
}