import CommonForm from '@/components/common/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAboutFormIndex } from '@/config/allFormIndex';
import { addUpdateAboutData, getAboutData, clearError, clearSuccess } from '@/store/about.slice';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const initialFormData = {
      aboutImage: "",
      paragraphs: "",
};

const AdminViewAbout = () => {
      const [formData, setFormData] = useState(initialFormData);
      const dispatch = useDispatch();
      const { aboutData, isLoading, error, success } = useSelector((state) => state.about);

      useEffect(() => {
            dispatch(getAboutData());
      }, [dispatch]);

      useEffect(() => {
            if (aboutData) {
                  setFormData({
                        aboutImage: aboutData.aboutImage?.url || "",
                        paragraphs: aboutData.paragraphs || "",
                  });
            }
      }, [aboutData]);

      useEffect(() => {
            if (success) {
                  toast.success("About section updated successfully!");
                  dispatch(clearSuccess());
            }
            if (error) {
                  toast.error(error?.message || "Failed to update about section.");
                  dispatch(clearError());
            }
      }, [success, error, dispatch]);

      const handleChange = (name, value) => {
            setFormData((prev) => ({
                  ...prev,
                  [name]: value,
            }));
      };

      const handleSubmit = async (e) => {
            e.preventDefault();

            const submissionData = new FormData();

            if (formData.aboutImage instanceof File) {
                  submissionData.append("aboutImage", formData.aboutImage);
            }

            if (formData.paragraphs) {
                  submissionData.append("paragraphs", formData.paragraphs.trim());
            }

            dispatch(addUpdateAboutData(submissionData));
      };

      const currentDatabaseData = aboutData;

      return (
            <Fragment>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div>
                              <Card>
                                    <CardHeader>
                                          <CardTitle>Current About Content</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                          {isLoading ? (
                                                <div className="container mx-auto px-4 text-center">
                                                      <Skeleton className="w-60 h-60 rounded-full mx-auto mb-6" />
                                                      <Skeleton className="h-6 w-3/4 mx-auto mb-4" />
                                                      <Skeleton className="h-24 w-full max-w-xl mx-auto mb-4" />
                                                </div>
                                          ) : currentDatabaseData ? (
                                                <div className="container mx-auto px-4 text-center">
                                                      {currentDatabaseData.aboutImage && (
                                                            <img
                                                                  src={currentDatabaseData.aboutImage.url}
                                                                  alt="About"
                                                                  className="w-60 h-60 object-cover rounded-full mx-auto mb-6 border-4 border-primary/20"
                                                            />
                                                      )}
                                                      {currentDatabaseData.paragraphs && (
                                                            <p>{currentDatabaseData.paragraphs}</p>
                                                      )}
                                                </div>
                                          ) : (
                                                <div className="text-center p-8 text-muted-foreground">
                                                      <p>No About data found in database.</p>
                                                      <p>Please use form to add content.</p>
                                                </div>
                                          )}
                                    </CardContent>
                              </Card>
                        </div>

                        <div>
                              <Card>
                                    <CardHeader>
                                          <CardTitle>Update About Content</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                          {isLoading ? (
                                                <div className="space-y-4">
                                                      <Skeleton className="h-10 w-full" />
                                                      <Skeleton className="h-24 w-full" />
                                                      <Skeleton className="h-10 w-32" />
                                                </div>
                                          ) : (
                                                <CommonForm
                                                      formControls={adminAboutFormIndex}
                                                      buttonText="Save Changes"
                                                      onSubmit={handleSubmit}
                                                      values={formData}
                                                      onChange={handleChange}
                                                      isLoading={isLoading}
                                                />
                                          )}
                                    </CardContent>
                              </Card>
                        </div>
                  </div>
            </Fragment>
      );
};

export default AdminViewAbout;