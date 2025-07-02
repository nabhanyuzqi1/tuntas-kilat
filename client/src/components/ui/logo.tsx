import { Car } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const containerSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${containerSizes[size]} bg-primary rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden`}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-1 right-1 w-2 h-2 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/30 rounded-full"></div>
        
        {/* Main icon */}
        <Car className={`${iconSizes[size]} text-white relative z-10`} />
      </div>
      
      {/* Text */}
      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold text-gray-900 leading-tight`}>
            Tuntas Kilat
          </h1>
          {size !== "sm" && (
            <p className="text-xs text-gray-500 -mt-1">Service On Demand</p>
          )}
        </div>
      )}
    </div>
  );
}