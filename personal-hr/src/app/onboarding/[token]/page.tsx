import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import OnboardingForm from "./OnboardingForm"

export default async function OnboardingPage({ params }: { params: { token: string } }) {
  const { token } = await params
  
  const link = await prisma.onboardingLink.findUnique({
    where: { token }
  })

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl text-center">
          <div className="card-body">
            <h2 className="card-title text-error justify-center">Invalid Link</h2>
            <p>This onboarding link is invalid or has expired.</p>
          </div>
        </div>
      </div>
    )
  }

  if (link.isUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl text-center">
          <div className="card-body">
            <h2 className="card-title text-success justify-center">Already Submitted</h2>
            <p>You have already submitted your data. Thank you!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary">Welcome to the Team, {link.name}!</h1>
          <p className="opacity-70 mt-2">Please complete your personal information for HR processing.</p>
        </div>
        
        <OnboardingForm candidate={link} />
      </div>
    </div>
  )
}
