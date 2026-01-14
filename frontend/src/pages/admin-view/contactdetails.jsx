import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import CommonForm from '@/components/common/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminContactFormIndex, socialLinkFormControls } from '@/config/allFormIndex';
import { addUpdateContactDetails, getContactDetails, resetMessageState } from '@/store/contact.slice';
import { Mail, MapPin, Phone, UserRound, Plus, Trash2 } from 'lucide-react';

const initialFormData = {
      contactImage: '',
      name: '',
      email: '',
      mobile: '',
      address: '',
      socialLinks: []
};

const AdminViewContactDetails = () => {
      const [formData, setFormData] = useState(initialFormData);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const dispatch = useDispatch();
      const { contactDetails, loading } = useSelector((state) => state.contact);

      useEffect(() => {
            dispatch(getContactDetails());
      }, [dispatch]);

      useEffect(() => {
            if (contactDetails) {
                  console.log('Contact Details:', contactDetails); // Debug log
                  setFormData({
                        contactImage: contactDetails.contactImage?.url || '',
                        name: contactDetails.name || '',
                        email: contactDetails.email || '',
                        mobile: contactDetails.mobile || '',
                        address: contactDetails.address || '',
                        socialLinks: contactDetails.socialLinks || []
                  });
            }
      }, [contactDetails]);

      const handleChange = (name, value) => {
            setFormData((prev) => ({
                  ...prev,
                  [name]: value,
            }));
      };

      const addSocialLink = () => {
            setFormData(prev => ({
                  ...prev,
                  socialLinks: [...prev.socialLinks, { platform: '', url: '', icon: '' }]
            }));
      };

      const removeSocialLink = (index) => {
            setFormData(prev => ({
                  ...prev,
                  socialLinks: prev.socialLinks.filter((_, i) => i !== index)
            }));
      };

      const updateSocialLink = (index, field, value) => {
            setFormData(prev => ({
                  ...prev,
                  socialLinks: prev.socialLinks.map((link, i) => 
                        i === index ? { ...link, [field]: value } : link
                  )
            }));
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setIsSubmitting(true);

            const submissionData = new FormData();

            if (formData.contactImage instanceof File) {
                  submissionData.append('contactImage', formData.contactImage);
            }
            if (formData.name) submissionData.append('name', formData.name.trim());
            if (formData.email) submissionData.append('email', formData.email.trim());
            if (formData.mobile) submissionData.append('mobile', formData.mobile.trim());
            if (formData.address) submissionData.append('address', formData.address.trim());
            if (formData.socialLinks.length > 0) {
                  submissionData.append('socialLinks', JSON.stringify(formData.socialLinks));
            }

            try {
                  await dispatch(addUpdateContactDetails(submissionData)).unwrap();
                  toast.success('Contact details saved successfully');
                  // Refresh contact details after successful update
                  dispatch(getContactDetails());
            } catch (err) {
                  console.error('Save contact details error:', err);
                  toast.error(err || 'Failed to save contact details');
            } finally {
                  setIsSubmitting(false);
            }
      };

      return (
            <Fragment>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div>
                              <Card>
                                    <CardHeader>
                                          <CardTitle>Current Contact Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                          {loading ? (
                                                <div className="container mx-auto px-4 text-center">
                                                      <Skeleton className="w-40 h-40 rounded-full mx-auto mb-6" />
                                                      <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                                                      <Skeleton className="h-6 w-5/6 mx-auto mb-2" />
                                                      <Skeleton className="h-6 w-2/3 mx-auto" />
                                                </div>
                                          ) : contactDetails ? (
                                                <div className="container mx-auto px-4 text-center space-y-2">
                                                      {contactDetails.contactImage?.url ? (
                                                            <img
                                                                  src={contactDetails.contactImage.url}
                                                                  alt="Contact"
                                                                  className="w-40 h-40 object-cover rounded-full mx-auto mb-6 border-4 border-primary/20"
                                                                  onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                  }}
                                                            />
                                                      ) : null}
                                                      <div className="w-40 h-40 bg-muted rounded-full mx-auto mb-6 border-4 border-primary/20 flex items-center justify-center" style={{ display: contactDetails.contactImage?.url ? 'none' : 'flex' }}>
                                                            <UserRound className="h-16 w-16 text-muted-foreground" />
                                                      </div>
                                                      {contactDetails.name && (
                                                            <div className="font-semibold flex items-center gap-2 justify-center"><UserRound className="h-4 w-4" /> {contactDetails.name}</div>
                                                      )}
                                                      {contactDetails.email && (
                                                            <div className="text-sm text-muted-foreground flex items-center gap-2 justify-center"><Mail className="h-4 w-4" /> {contactDetails.email}</div>
                                                      )}
                                                      {contactDetails.mobile && (
                                                            <div className="text-sm text-muted-foreground flex items-center gap-2 justify-center"><Phone className="h-4 w-4" /> {contactDetails.mobile}</div>
                                                      )}
                                                      {contactDetails.address && (
                                                            <div className="text-sm text-muted-foreground flex items-center gap-2 justify-center"><MapPin className="h-4 w-4" /> {contactDetails.address}</div>
                                                      )}
                                                      {contactDetails.socialLinks && contactDetails.socialLinks.length > 0 && (
                                                            <div className="mt-4">
                                                                  <h4 className="font-medium mb-2">Social Links:</h4>
                                                                  <div className="flex flex-wrap gap-2 justify-center">
                                                                        {contactDetails.socialLinks.map((link, index) => (
                                                                              <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                                                                                    {link.platform}
                                                                              </span>
                                                                        ))}
                                                                  </div>
                                                            </div>
                                                      )}
                                                </div>
                                          ) : (
                                                <div className="text-center p-8 text-muted-foreground">
                                                      <p>No contact details found.</p>
                                                      <p>Please use the form to add details.</p>
                                                </div>
                                          )}
                                    </CardContent>
                              </Card>
                        </div>

                        <div>
                              <Card>
                                    <CardHeader>
                                          <CardTitle>Update Contact Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                          {loading && !contactDetails ? (
                                                <div className="space-y-4">
                                                      <Skeleton className="h-10 w-full" />
                                                      <Skeleton className="h-10 w-full" />
                                                      <Skeleton className="h-10 w-full" />
                                                      <Skeleton className="h-24 w-full" />
                                                      <Skeleton className="h-10 w-32" />
                                                </div>
                                          ) : (
                                                <div className="space-y-6">
                                                      <CommonForm
                                                            formControls={adminContactFormIndex}
                                                            buttonText={isSubmitting ? "Saving..." : "Save Changes"}
                                                            onSubmit={handleSubmit}
                                                            values={formData}
                                                            onChange={handleChange}
                                                            isLoading={isSubmitting}
                                                      />
                                                      
                                                      {/* Social Links Section */}
                                                      <div className="border-t pt-6">
                                                            <div className="flex items-center justify-between mb-4">
                                                                  <h3 className="text-lg font-semibold">Social Links</h3>
                                                                  <Button
                                                                        type="button"
                                                                        onClick={addSocialLink}
                                                                        size="sm"
                                                                        className="flex items-center gap-2 hero-gradient text-muted"
                                                                  >
                                                                        <Plus className="h-4 w-4" />
                                                                        Add Link
                                                                  </Button>
                                                            </div>
                                                            
                                                            {formData.socialLinks.map((link, index) => (
                                                                  <div key={index} className="flex gap-2 mb-4 p-4 border rounded-lg">
                                                                        <div className="flex-1">
                                                                              <CommonForm
                                                                                    formControls={socialLinkFormControls}
                                                                                    buttonText=""
                                                                                    values={link}
                                                                                    onChange={(name, value) => updateSocialLink(index, name, value)}
                                                                                    onSubmit={(e) => e.preventDefault()}
                                                                              />
                                                                        </div>
                                                                        <Button
                                                                              type="button"
                                                                              onClick={() => removeSocialLink(index)}
                                                                              variant="destructive"
                                                                              size="sm"
                                                                              className="self-start mt-2"
                                                                        >
                                                                              <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                  </div>
                                                            ))}
                                                            
                                                            {formData.socialLinks.length === 0 && (
                                                                  <p className="text-muted-foreground text-sm">No social links added yet.</p>
                                                            )}
                                                      </div>
                                                </div>
                                          )}
                                    </CardContent>
                              </Card>
                        </div>
                  </div>
            </Fragment>
      );
};

export default AdminViewContactDetails;