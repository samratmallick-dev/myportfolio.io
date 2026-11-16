import CommonForm from '@/components/common/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ContactDetail from '@/components/user-view/contact-details';
import { contactFormIndex } from '@/config/allFormIndex';
import { Facebook, Github, Instagram, Linkedin, Twitter, Youtube, Globe, Mail, Phone } from 'lucide-react';
import React, { useState } from 'react';
import profileImage from '@/assets/profileimage.jpg';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { sendMessage } from '@/store/contact.slice';
import { updatePublicData } from '@/store/public.slice';
import { useSocket } from '@/hooks/useSocket';
import { usePublicSectionData } from '@/hooks/usePublicSectionData';
import SectionError from '@/components/loaders/SectionError';
import OptimizedImage from '@/components/common/OptimizedImage';
import { Skeleton } from '@/components/ui/skeleton';

const initialFormData = {
      name: '',
      email: '',
      mobile: '',
      message: ''
};

const MyContact = () => {
      const dispatch = useDispatch();
      const { messageSubmitting } = useSelector((state) => state.contact);
      const [formData, setFormData] = useState(initialFormData);

      // Only the contact section is fetched; the rest of the public site is
      // irrelevant to this route.
      const { data: contactDetails, isLoading, isIdle, isError, error, retry } = usePublicSectionData("contact", {
            priority: true,
      });

      useSocket("portfolioUpdated", ({ type, data }) => {
            if (type === "contact") dispatch(updatePublicData({ type, data }));
      });

      const getIconComponent = (iconName) => {
            const icons = {
                  Facebook,
                  Github,
                  Instagram,
                  Linkedin,
                  Twitter,
                  Youtube,
                  Globe,
                  Mail,
                  Phone
            };
            return icons[iconName] || Globe;
      };

      const handleChange = (name, value) => {
            setFormData(prev => ({
                  ...prev,
                  [name]: value
            }));
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  await dispatch(sendMessage(formData)).unwrap();
                  toast.success('Message sent successfully!');
                  setFormData(initialFormData);
            } catch (err) {
                  toast.error(err || 'Failed to send message');
            }
      };



      return (
            <section id="contact" className="py-20 mt-10">
                  <div className="container mx-auto px-4">
                        <div className="w-full flex lg:flex-row flex-col items-center gap-4">
                              <h2 className="text-5xl font-bold text-center text-gradient">Get In Touch</h2>
                              <div className="w-44 h-1 bg-linear-to-l from-primary to-secondary rounded-lg flex order-last lg:mt-10 mt-0"></div>
                        </div>
                        <div className='w-full flex flex-col md:flex-row items-center gap-4 mt-8'>
                              <div className='md:w-1/2 w-full flex flex-col items-center justify-center gap-8'>
                                    <OptimizedImage
                                          src={contactDetails?.contactImage?.url}
                                          fallbackSrc={profileImage}
                                          alt="Contact"
                                          width="160"
                                          height="160"
                                          widths={[160, 240, 320]}
                                          sizes="160px"
                                          loading="eager"
                                          className="w-40 h-40 rounded-full mx-auto border-4 border-primary/20 object-cover"
                                    />
                                    <Card className="hover-lift tech-glow">
                                          <CardHeader className="text-center text-3xl font-bold text-gradient">
                                                <CardTitle>Contact & Location</CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                                {isLoading || isIdle ? (
                                                      <div className="space-y-4">
                                                            {[...Array(4)].map((_, index) => (
                                                                  <Skeleton key={index} className="h-6 w-full" />
                                                            ))}
                                                      </div>
                                                ) : isError ? (
                                                      <SectionError message={error || 'Unable to load contact details.'} onRetry={retry} />
                                                ) : contactDetails ? (
                                                      [
                                                            { label: 'Name', value: contactDetails.name || 'Samrat Mallick', link: 'https://myportfolio-io-dusky.vercel.app' },
                                                            { label: 'Email', value: contactDetails.email || 'samratmallick832@gmail.com', link: contactDetails.email ? `mailto:${contactDetails.email}` : `mailto:samratmallick832@gmail.com` },
                                                            { label: 'Mobile', value: contactDetails.mobile || '+919883203654', link: contactDetails.mobile ? `tel:${contactDetails.mobile}` : 'tel:+919883203654' },
                                                            { label: 'Address', value: contactDetails.address || 'Banbania, Ashoknagar, Ashoknagar Kalyangarh(M), Habra, North 24 Parganas, West Bengal-743263, India', link: `https://maps.app.goo.gl/EgqL6cFEXFJZgub48`},
                                                      ].map((item, index) => (
                                                            <ContactDetail key={index} label={item.label} value={
                                                                  <Link to={item.link} target="_blank" rel="noopener noreferrer">{item.value}</Link>
                                                            } />
                                                      ))
                                                ) : (
                                                      <div className="text-center text-muted-foreground">No contact details found.</div>
                                                )}
                                          </CardContent>
                                          <CardFooter className={'flex items-center gap-4 flex-wrap'}>
                                                {/* <Button
                                                      onClick={() => window.open('https://www.facebook.com/samratmallick.dev/', '_blank')}
                                                      variant="outline"
                                                      size="sm"
                                                      className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300 ease-out"
                                                >
                                                      <Facebook className="w-5 h-5 mr-2" />
                                                      Facebook
                                                </Button>
                                                <Button
                                                      onClick={() => window.open('https://www.instagram.com/samratmallick.dev/', '_blank')}
                                                      variant="outline"
                                                      size="sm"
                                                      className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300 ease-out"
                                                >
                                                      <Instagram className="w-5 h-5 mr-2" />
                                                      Instagram
                                                </Button>
                                                <Button
                                                      onClick={() => window.open('https://github.com/samratmallick-dev/', '_blank')}
                                                      variant="outline"
                                                      size="sm"
                                                      className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300 ease-out"
                                                >
                                                      <Github className="w-5 h-5 mr-2" />
                                                      GitHub
                                                </Button>
                                                <Button
                                                      onClick={() => window.open('https://www.linkedin.com/in/samrat-mallick01', '_blank')}
                                                      variant="outline"
                                                      size="sm"
                                                      className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300 ease-out"
                                                >
                                                      <Linkedin className="w-5 h-5 mr-2" />
                                                      LinkedIn
                                                </Button> */}
                                                {
                                                      contactDetails?.socialLinks?.map((item, index) => {
                                                            const IconComponent = getIconComponent(item.icon);
                                                            return (
                                                                  <Button
                                                                        key={index}
                                                                        onClick={() => window.open(item.url, '_blank')}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300 ease-out"
                                                                  >
                                                                        <IconComponent className="w-5 h-5 mr-2" />
                                                                        {item.platform}
                                                                  </Button>
                                                            );
                                                      })
                                                }
                                          </CardFooter>
                                    </Card>
                              </div>
                              <div className='md:w-1/2 w-full flex items-center justify-center'>
                                    <Card className="hover-lift bg-card/80 tech-glow w-full max-w-lg flex flex-col p-4 md:p-6 lg:p-8">
                                          <CardHeader className="text-2xl font-semibold">
                                                <CardTitle>Send Me a Message</CardTitle>
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
}

export default MyContact;