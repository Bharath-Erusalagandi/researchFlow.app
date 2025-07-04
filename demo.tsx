import { GradientButton } from "@/components/ui/gradient-button"
import Image from "next/image"

function Demo() {
  return (
    <div className="flex flex-col gap-8 p-8 items-center bg-black min-h-screen">
      <h1 className="text-white text-2xl font-bold mb-4">Gradient Button Demo</h1>
      
      <div className="w-full max-w-md space-y-4">
        <GradientButton className="w-full py-3 flex items-center justify-center gap-2 rounded-xl">
          <Image 
            src="/google-icon.svg" 
            alt="Google" 
            width={24} 
            height={24}
            className="mr-2"
          />
          <span className="font-medium">Sign in with Google</span>
        </GradientButton>
        
        <GradientButton variant="variant" className="w-full py-3 rounded-xl">
          <span className="font-medium">Sign In</span>
        </GradientButton>
      </div>
    </div>
  )
}

export { Demo } 