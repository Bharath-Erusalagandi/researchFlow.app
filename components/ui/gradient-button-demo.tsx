import { GradientButton } from "@/components/ui/gradient-button"
import { Mail, Users, LogIn } from "lucide-react"

export function GradientButtonDemo() {
  return (
    <div className="flex flex-col gap-6 p-8 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white text-center">Gradient Button Demo</h2>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <GradientButton className="flex-1">
          <Users className="w-5 h-5" />
          Default Variant
        </GradientButton>
        
        <GradientButton variant="variant" className="flex-1">
          <Mail className="w-5 h-5" />
          Blue Variant
        </GradientButton>
        
        <GradientButton variant="red" className="flex-1">
          <LogIn className="w-5 h-5" />
          Red Variant
        </GradientButton>
      </div>

      <div className="text-sm text-gray-400 text-center">
        <p>Hover over the buttons to see the gradient animation effects</p>
        <p>All variants support icons and custom content</p>
      </div>
    </div>
  )
} 