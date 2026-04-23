import { TypographyH2, TypographyMuted, TypographyP } from '@/components/ui/typography'

export default function ContactPage() {
    return (
        <div className="mx-auto max-w-3xl p-4 pb-10">
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

            {/* Google Maps embed — JIPMER Campus, Gorimedu, Puducherry */}
            <div className="mt-8">
                <TypographyP className="mb-2 font-semibold">Our Location</TypographyP>
                <div className="overflow-hidden rounded shadow">
                    <iframe
                        id="jipmer-campus-map"
                        title="JIPMER Campus Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.6!2d79.8083!3d11.9416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5361ab8e49cfcf%3A0xcc6bd326d2f0b04e!2sJIPMER%20-%20Jawaharlal%20Institute%20of%20Postgraduate%20Medical%20Education%20and%20Research!5e0!3m2!1sen!2sin!4v1700000000000"
                        width="100%"
                        height="300"
                        className="h-[250px] sm:h-[300px] md:h-[400px]"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </div>
    )
}

