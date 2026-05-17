import { TypographyH2, TypographyMuted, TypographyP } from '@/components/ui/typography'

export default function ContactPage() {
    return (
        <div className="mx-auto max-w-3xl p-4">
            <TypographyH2>Contact Us</TypographyH2>

            <TypographyP className="mb-4">
                For any queries or technical issues related to the PuduCan Portal, please reach out
                to us using the following contact information:
            </TypographyP>

            <div className="bg-sidebar-accent space-y-4 rounded p-4 shadow">
                <div>
                    <TypographyP className="font-semibold">Institution:</TypographyP>

                    <div>
                        <TypographyMuted>
                            Jawaharlal Institute of Postgraduate Medical Education and Research
                            (JIPMER)
                        </TypographyMuted>
                    </div>
                </div>

                <div>
                    <TypographyP className="font-semibold">Address:</TypographyP>

                    <TypographyMuted>
                        JIPMER Campus Rd, Gorimedu, Dhanvantari Nagar, Puducherry - 605006
                    </TypographyMuted>
                </div>

                <div>
                    <TypographyP className="font-semibold">Email:</TypographyP>

                    <TypographyMuted>PuduCan-support@jipmer.edu.in</TypographyMuted>
                </div>

                <div>
                    <TypographyP className="font-semibold">Phone:</TypographyP>

                    <TypographyMuted>+91 2222 2222</TypographyMuted>
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl shadow">
                <iframe
                    src="https://maps.google.com/maps?q=11.9416,79.8083&z=15&output=embed"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </div>
    )
}