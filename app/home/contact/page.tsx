import { TypographyH2, TypographyMuted } from '@/components/ui/typography'
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="mx-auto mt-12 max-w-4xl px-4 pb-16">
      
      <div className="text-center mb-16 space-y-4">
        <TypographyH2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#007AFF] dark:text-[#5BB4FF]">
          Contact Support
        </TypographyH2>
        <TypographyMuted className="text-base md:text-lg max-w-xl mx-auto">
          Need assistance with the portal or have questions about the study? We're here to help.
        </TypographyMuted>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Email Card */}
        <div className="bg-card p-8 rounded-[24px] border border-border shadow-sm flex flex-col items-center text-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-6">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-xl mb-2">Technical Support</h3>
          <p className="text-sm text-muted-foreground mb-6">For login issues, data entry errors, or portal training.</p>
          <a 
            href="mailto:support@puducan.example.com" 
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors w-full"
          >
            Send an Email
          </a>
        </div>

        {/* Phone Card */}
        <div className="bg-card p-8 rounded-[24px] border border-border shadow-sm flex flex-col items-center text-center">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full mb-6">
            <Phone className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="font-bold text-xl mb-2">Study Coordinator</h3>
          <p className="text-sm text-muted-foreground mb-6">For clinical inquiries, protocol questions, and ASHA routing.</p>
          <a 
            href="tel:+910000000000" 
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors w-full"
          >
            Call Coordinator
          </a>
        </div>
      </div>

      {/* Address Wide Card (Mirrors the bottom section of the homepage) */}
      <div className="bg-card p-6 md:p-8 rounded-[24px] border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="bg-secondary p-4 rounded-xl shrink-0">
          <MapPin className="h-6 w-6 text-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">JIPMER Campus</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Jawaharlal Institute of Postgraduate Medical Education and Research<br/>
            Dhanvantari Nagar, Puducherry, 605006, India
          </p>
        </div>
        <a 
          href="https://goo.gl/maps/example" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline shrink-0"
        >
          View on Map <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </div>

    </div>
  )
}