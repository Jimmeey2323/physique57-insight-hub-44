import React, { useState } from "react";
import { BarChart3, TrendingUp, Users, UserCheck, Calendar, Tag, ChevronRight, BarChart2, Target } from "lucide-react";

// Utility function for className merging
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
interface DashboardButton {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  hoverColor: string;
  bgGradient: string;
}
interface DashboardGridProps {
  buttons?: DashboardButton[];
  onButtonClick?: (buttonId: string) => void;
}
const defaultButtons: DashboardButton[] = [{
  id: "executive-summary",
  label: "Executive Summary",
  description: "Strategic Performance Overview & Key Metrics",
  icon: <BarChart3 size={28} />,
  color: "text-slate-700",
  gradient: "from-slate-50 to-slate-100",
  hoverColor: "hover:border-slate-300",
  bgGradient: "from-slate-700 to-slate-800"
}, {
  id: "sales-analytics",
  label: "Sales Analytics",
  description: "Revenue Intelligence & Sales Performance",
  icon: <TrendingUp size={28} />,
  color: "text-emerald-700",
  gradient: "from-emerald-50 to-emerald-100",
  hoverColor: "hover:border-emerald-300",
  bgGradient: "from-emerald-600 to-emerald-700"
}, {
  id: "funnel-leads",
  label: "Funnel & Lead Performance",
  description: "Lead Pipeline Efficiency and Conversion Metrics",
  icon: <BarChart2 size={28} />,
  color: "text-blue-700",
  gradient: "from-blue-50 to-blue-100",
  hoverColor: "hover:border-blue-300",
  bgGradient: "from-blue-600 to-blue-700"
}, {
  id: "client-retention",
  label: "Client Conversion & Retention",
  description: "Client Acquisition and Retention Analysis",
  icon: <Users size={28} />,
  color: "text-orange-700",
  gradient: "from-orange-50 to-orange-100",
  hoverColor: "hover:border-orange-300",
  bgGradient: "from-orange-600 to-orange-700"
}, {
  id: "trainer-performance",
  label: "Trainer Performance",
  description: "Instructor Productivity and Engagement Metrics",
  icon: <UserCheck size={28} />,
  color: "text-teal-700",
  gradient: "from-teal-50 to-teal-100",
  hoverColor: "hover:border-teal-300",
  bgGradient: "from-teal-600 to-teal-700"
}, {
  id: "class-attendance",
  label: "Class Attendance",
  description: "Utilization and Attendance Trends",
  icon: <Calendar size={28} />,
  color: "text-indigo-700",
  gradient: "from-indigo-50 to-indigo-100",
  hoverColor: "hover:border-indigo-300",
  bgGradient: "from-indigo-600 to-indigo-700"
}, {
  id: "discounts-promotions",
  label: "Discounts & Promotions",
  description: "Promotional Impact and Discount Analysis",
  icon: <Tag size={28} />,
  color: "text-pink-700",
  gradient: "from-pink-50 to-pink-100",
  hoverColor: "hover:border-pink-300",
  bgGradient: "from-pink-600 to-pink-700"
}, {
  id: "sessions",
  label: "Sessions Analytics",
  description: "Session Management and Performance Analytics",
  icon: <BarChart3 size={28} />,
  color: "text-purple-700",
  gradient: "from-purple-50 to-purple-100",
  hoverColor: "hover:border-purple-300",
  bgGradient: "from-purple-600 to-purple-700"
}, {
  id: "powercycle-vs-barre",
  label: "PowerCycle vs Barre",
  description: "Comparative Analysis of Class Formats",
  icon: <Target size={28} />,
  color: "text-violet-700",
  gradient: "from-violet-50 to-violet-100",
  hoverColor: "hover:border-violet-300",
  bgGradient: "from-violet-600 to-violet-700"
}];
export function DashboardGrid({
  buttons = defaultButtons,
  onButtonClick = () => {}
}: DashboardGridProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  const handleButtonClick = (buttonId: string) => {
    setClickedButton(buttonId);
    onButtonClick(buttonId);

    // Reset click animation after a short delay
    setTimeout(() => {
      setClickedButton(null);
    }, 150);
  };
  return <div className="w-full max-w-7xl mx-auto space-y-16">
      {/* Refined Header Section */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-light text-slate-900 tracking-wide">
          Business Intelligence <span className="font-semibold">Modules</span>
        </h2>
        
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
          Access comprehensive analytics and insights to drive strategic business decisions
        </p>
        
        <div className="w-16 h-px bg-slate-300 mx-auto"></div>
      </div>
      
      {/* Sleeker Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2">
        {buttons.map(button => <button key={button.id} className={cn("group relative overflow-hidden", "bg-white border border-slate-200 rounded-2xl", "p-8 text-left transition-all duration-300 ease-out", "hover:shadow-xl hover:shadow-slate-200/60", "hover:-translate-y-1 hover:scale-[1.01]", "focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400", "active:scale-[0.98] active:transition-transform active:duration-100", button.hoverColor, clickedButton === button.id && "scale-[0.98]", hoveredButton === button.id && "border-slate-300 shadow-lg")} onMouseEnter={() => setHoveredButton(button.id)} onMouseLeave={() => setHoveredButton(null)} onClick={() => handleButtonClick(button.id)}>
            {/* Subtle Background Overlay */}
            <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-300", `bg-gradient-to-br ${button.gradient}`, hoveredButton === button.id && "opacity-50")} />
            
            {/* Content */}
            <div className="relative z-10 space-y-5">
              {/* Icon Container */}
              <div className={cn("inline-flex items-center justify-center", "w-16 h-16 rounded-xl mb-2", "bg-slate-50 border border-slate-200", "transition-all duration-300", button.color, hoveredButton === button.id && "shadow-md scale-105", hoveredButton === button.id && `bg-gradient-to-br ${button.bgGradient} text-white border-transparent`)}>
                {button.icon}
              </div>
              
              {/* Text Content */}
              <div className="space-y-3">
                <h3 className={cn("text-lg font-semibold text-slate-900 leading-tight", "transition-colors duration-300", hoveredButton === button.id && button.color)}>
                  {button.label}
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed font-light">
                  {button.description}
                </p>
              </div>
            </div>
            
            {/* Floating Arrow */}
            <div className={cn("absolute top-6 right-6", "transition-all duration-300", "opacity-0 translate-x-2 scale-90", hoveredButton === button.id && "opacity-100 translate-x-0 scale-100")}>
              <div className={cn("flex items-center justify-center", "w-8 h-8 rounded-lg", "bg-white border border-slate-200", "transition-all duration-300", button.color, hoveredButton === button.id && `bg-gradient-to-br ${button.bgGradient} text-white border-transparent`)}>
                <ChevronRight size={14} />
              </div>
            </div>
            
            {/* Bottom Accent Line */}
            <div className={cn("absolute bottom-0 left-0 right-0 h-0.5", "bg-gradient-to-r transition-all duration-300", button.bgGradient, "opacity-0 scale-x-0", hoveredButton === button.id && "opacity-100 scale-x-100")} />
          </button>)}
      </div>
    </div>;
}