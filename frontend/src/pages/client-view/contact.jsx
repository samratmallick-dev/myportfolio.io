import CommonForm from '@/components/common/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ContactDetail from '@/components/user-view/contact-details';
import { contactFormIndex } from '@/config/allFormIndex';
import * as LucideIcons from 'lucide-react';
import React, { useEffect, useState } from 'react';
import profileImage from '@/assets/profileimage.png';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getContactDetails, sendMessage } from '@/store/contact.slice';
import { toast } from 'sonner';

const initialFormData = {
      name: '',
      email: '',
      mobile: '',
      message: ''
};

const MyContact = () => {
      const dispatch = useDispatch();
      const { contactDetails, loading } = useSelector((state) => state?.contact || {});
      const [formData, setFormData] = useState(initialFormData);

      useEffect(() => {
            dispatch(getContactDetails()).catch(() => {});
      }, [dispatch]);

      const handleChange = (name, value) => {
            setFormData(prev => ({
                  ...prev,
                  [name]: value
            }));
      };

      const getSocialIcon = (iconName) => {
            const Icon = LucideIcons[iconName];
            return Icon ? <Icon className="w-5 h-5 mr-2" /> : null;
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
                                    <img 
                                          src={contactDetails?.contactImage?.url || profileImage} 
                                          alt="Contact" 
                                          className="w-40 h-40 rounded-full mx-auto border-4 border-primary/20 object-cover" 
                                    />
                                    <Card className="hover-lift tech-glow">
                                          <CardHeader className="text-center text-3xl font-bold text-gradient">
                                                <CardTitle>Contact & Location</CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                                {contactDetails ? (
                                                      <>
                                                            <ContactDetail 
                                                                  label="Name" 
                                                                  value={<Link to="#">{contactDetails.name || '-'}</Link>} 
                                                            />
                                                            <ContactDetail 
                                                                  label="Email" 
                                                                  value={
                                                                        <Link 
                                                                              to={contactDetails.email ? `mailto:${contactDetails.email}` : '#'} 
                                                                              rel="noopener noreferrer"
                                                                        >
                                                                              {contactDetails.email || '-'}
                                                                        </Link>
                                                                  } 
                                                            />
                                                            <ContactDetail 
                                                                  label="Mobile" 
                                                                  value={
                                                                        <Link 
                                                                              to={contactDetails.mobile ? `tel:${contactDetails.mobile}` : '#'} 
                                                                              rel="noopener noreferrer"
                                                                        >
                                                                              {contactDetails.mobile || '-'}
                                                                        </Link>
                                                                  } 
                                                            />
                                                            <ContactDetail 
                                                                  label="Address" 
                                                                  value={<Link to="#">{contactDetails.address || '-'}</Link>} 
                                                            />
                                                      </>
                                                ) : (
                                                      <div className="text-center text-muted-foreground">No contact details found.</div>
                                                )}
                                          </CardContent>
                                          <CardFooter className={'flex items-center gap-4 flex-wrap'}>
                                                {contactDetails?.socialLinks && contactDetails.socialLinks.length > 0 ? (
                                                      contactDetails.socialLinks.map((link, index) => (
                                                            <Button
                                                                  key={index}
                                                                  onClick={() => window.open(link.url, '_blank')}
                                                                  variant="outline"
                                                                  size="sm"
                                                                  className="hover:bg-primary text-muted-foreground hover:text-white transition-colors duration-300 ease-out"
                                                            >
                                                                  {getSocialIcon(link.icon)}
                                                                  {link.platform}
                                                            </Button>
                                                      ))
                                                ) : null}
                                          </CardFooter>
                                    </Card>
                              </div>
                              <div className='md:w-1/2 w-full flex items-center justify-center'>
                                    <Card className="hover-lift bg-background/30 hover:border-0 tech-glow w-full max-w-lg flex flex-col p-4 md:p-6 lg:p-8">
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
                                                      isLoading={loading}
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