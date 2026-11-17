import React, { useCallback, useState } from "react";

import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Globe,
  Mail,
  Phone,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import ContactDetail from "@/components/user-view/contact-details";
import CommonForm from "@/components/common/form";

import { contactFormIndex } from "@/config/allFormIndex";

import { toast } from "sonner";

import { useDispatch, useSelector } from "react-redux";

import { sendMessage } from "@/store/contact.slice";
import { updatePublicData } from "@/store/public.slice";

import { useSocket } from "@/hooks/useSocket";
import { usePublicSectionData } from "@/hooks/usePublicSectionData";

import SectionError from "@/components/loaders/SectionError";
import OptimizedImage from "@/components/common/OptimizedImage";

import { Skeleton } from "@/components/ui/skeleton";


// Initial form state.
const initialFormData = {
  name: "",
  email: "",
  mobile: "",
  message: "",
};

// Available social media icons.
const SOCIAL_ICONS = {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Globe,
  Mail,
  Phone,
};

const MyContact = () => {
  const dispatch = useDispatch();

  const { messageSubmitting } = useSelector((state) => state.contact);

  const [formData, setFormData] = useState(initialFormData);

  // Fetch only the contact section.
  const {
    data: contactDetails,
    isLoading,
    isIdle,
    isError,
    error,
    retry,
  } = usePublicSectionData("contact", {
    priority: true,
  });

  // Update contact information when the server broadcasts changes.
  const handlePortfolioUpdate = useCallback(
    ({ type, data }) => {
      if (type === "contact") {
        dispatch(
          updatePublicData({
            type,
            data,
          }),
        );
      }
    },
    [dispatch],
  );

  useSocket("portfolioUpdated", handlePortfolioUpdate);

  // Update form values.
  const handleChange = useCallback((name, value) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }, []);

  // Submit contact message.
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await dispatch(sendMessage(formData)).unwrap();

      toast.success("Message sent successfully!");

      setFormData(initialFormData);
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Failed to send message.",
      );
    }
  };

  // Resolve social media icon.
  const getIconComponent = (iconName) => {
    return SOCIAL_ICONS[iconName] || Globe;
  };

  // Contact information.
  const contactItems = [
    {
      label: "Name",
      value: contactDetails?.name || "Samrat Mallick",
      href: "https://myportfolio-io-dusky.vercel.app",
    },
    {
      label: "Email",
      value: contactDetails?.email || "samratmallick832@gmail.com",
      href: `mailto:${contactDetails?.email || "samratmallick832@gmail.com"}`,
    },
    {
      label: "Mobile",
      value: contactDetails?.mobile || "+919883203654",
      href: `tel:${contactDetails?.mobile || "+919883203654"}`,
    },
    {
      label: "Address",
      value:
        contactDetails?.address ||
        "Banbania, Ashoknagar, Ashoknagar Kalyangarh(M), Habra, North 24 Parganas, West Bengal-743263, India",
      href: "https://maps.app.goo.gl/5rrfbaaRB3eM2Hak7",
    },
  ];

  return (
    <section
      id="contact"
      className="
        relative
        py-16 sm:py-20
        mt-6 sm:mt-10
        overflow-hidden
      "
    >
      <div
        className="
        container mx-auto
        px-4 sm:px-6
      "
      >
        {/* Section Heading */}
        <div
          className="
          flex flex-col
          items-center
          justify-center
          gap-4
          mb-10
        "
        >
          <h2
            className="
            text-3xl
            sm:text-4xl
            md:text-5xl
            font-bold
            text-center
            text-gradient
          "
          >
            Get In Touch
          </h2>

          <div
            className="
            w-36 sm:w-44
            h-1
            bg-linear-to-r
            from-primary
            to-secondary
            rounded-full
          "
          />
        </div>

        <div
          className="
          grid
          grid-cols-1
          lg:grid-cols-2
          items-start
          gap-8 lg:gap-12
        "
        >
          <div
            className="
            w-full
            flex flex-col
            items-center
            gap-6 sm:gap-8
          "
          >
            <div
              className="
              relative shrink-0
              w-56 sm:w-64 md:w-80 lg:w-96
              max-w-full
              mx-auto
              aspect-square
              overflow-hidden
              rounded-full
              border-[3px] border-primary/20
              shadow-xl
              [&>*]:block [&>*]:h-full [&>*]:w-full
              [&_img]:h-full [&_img]:w-full
              [&_img]:object-cover [&_img]:object-bottom
              [&_img]:origin-bottom [&_img]:scale-[1.12]
            "
            >
              <OptimizedImage
                src={contactDetails?.contactImage?.url}
                alt="Samrat Mallick - Contact Profile"
                width="384"
                height="384"
                widths={[224, 256, 320, 384, 448]}
                sizes="
                  (min-width: 1024px) 384px,
                  (min-width: 768px) 320px,
                  (min-width: 640px) 256px,
                  224px
                "
                loading="lazy"
                decoding="async"
                className="
                  block
                  h-full w-full
                  rounded-full
                  object-cover
                "
              />
            </div>

            {/* Contact Details Card */}
            <Card
              className="
              w-full
              bg-card/80
              backdrop-blur-sm
              border border-border
              rounded-2xl
              shadow-lg
              hover-lift
              tech-glow
            "
            >
              <CardHeader className="text-center">
                <CardTitle
                  className="
                  text-2xl
                  sm:text-3xl
                  font-bold
                  text-gradient
                "
                >
                  Contact & Location
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Loading State */}
                {(isLoading || isIdle) && (
                  <div className="space-y-5">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Error State */}
                {!isLoading && !isIdle && isError && (
                  <SectionError
                    message={error || "Unable to load contact details."}
                    onRetry={retry}
                  />
                )}

                {/* Contact Information */}
                {!isLoading && !isIdle && !isError && contactDetails && (
                  <div
                    className="
                      flex flex-col
                      gap-5
                      text-base sm:text-lg
                    "
                  >
                    {contactItems.map((item) => (
                      <ContactDetail
                        key={item.label}
                        label={item.label}
                        value={
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                                break-words
                                text-muted-foreground
                                hover:text-primary
                                transition-colors
                              "
                          >
                            {item.value}
                          </a>
                        }
                      />
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isIdle && !isError && !contactDetails && (
                  <div
                    className="
                      text-center
                      text-muted-foreground
                    "
                  >
                    No contact details found.
                  </div>
                )}
              </CardContent>

              {/* Social Media Links */}
              {contactDetails?.socialLinks?.length > 0 && (
                <CardFooter
                  className="
                  flex flex-wrap
                  items-center
                  justify-center sm:justify-start
                  gap-3
                "
                >
                  {contactDetails.socialLinks.map((item, index) => {
                    const IconComponent = getIconComponent(item.icon);

                    return (
                      <a
                        key={`${item.platform}-${index}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.platform}
                        className="
                          inline-flex
                          items-center
                          gap-2
                          px-3 py-2
                          text-sm
                          border border-border
                          rounded-lg
                          hover:bg-primary
                          hover:text-primary-foreground
                          hover:border-primary
                          transition-all duration-300
                        "
                      >
                        <IconComponent className="w-5 h-5" />
                        <span>{item.platform}</span>
                      </a>
                    );
                  })}
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Right: Contact Form */}
          <div
            className="
            w-full
            flex items-center
            justify-center
          "
          >
            <Card
              className="
              w-full
              max-w-2xl
              bg-card/80
              backdrop-blur-sm
              border border-border
              rounded-2xl
              shadow-lg
              hover-lift
              tech-glow
              p-3 sm:p-5
            "
            >
              <CardHeader>
                <CardTitle
                  className="
                  text-xl
                  sm:text-2xl
                  font-semibold
                  text-center sm:text-left
                "
                >
                  Send Me a Message
                </CardTitle>
              </CardHeader>

              <CardContent>
                <CommonForm
                  formControls={contactFormIndex}
                  onSubmit={handleSubmit}
                  buttonText="Send Message"
                  values={formData}
                  onChange={handleChange}
                  isLoading={messageSubmitting}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyContact;
