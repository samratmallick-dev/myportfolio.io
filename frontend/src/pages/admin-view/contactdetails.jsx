import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import CommonForm from "@/components/common/form";
import {
      Card,
      CardContent,
      CardHeader,
      CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
      Mail,
      MapPin,
      Phone,
      UserRound,
      Plus,
      Trash2,
} from "lucide-react";
import { adminContactFormIndex } from "@/config/allFormIndex";
import {
      addUpdateContact,
      getContactDetails,
} from "@/store/contact.slice";

const initialFormData = {
      contactImage: "",
      name: "",
      email: "",
      mobile: "",
      address: "",
      socialLinks: [],
};

const AdminViewContactDetails = () => {
      const dispatch = useDispatch();
      const { contactDetails, loading } = useSelector(
            (state) => state?.contact || {}
      );

      const [formData, setFormData] = useState(initialFormData);

      useEffect(() => {
            dispatch(getContactDetails()).catch(() => { });
      }, [dispatch]);

      useEffect(() => {
            if (!contactDetails) return;

            setFormData({
                  contactImage: "",
                  name: contactDetails.name || "",
                  email: contactDetails.email || "",
                  mobile: contactDetails.mobile || "",
                  address: contactDetails.address || "",
                  socialLinks: contactDetails.socialLinks || [],
            });
      }, [contactDetails]);

      const handleChange = (name, value) => {
            if (name === "contactImage" && value instanceof File) {
                  const maxSize = 20 * 1024 * 1024;
                  if (value.size > maxSize) {
                        toast.error("Image must be under 20MB");
                        return;
                  }
            }

            setFormData((prev) => ({
                  ...prev,
                  [name]: value,
            }));
      };

      const handleAddSocialLink = () => {
            setFormData((prev) => ({
                  ...prev,
                  socialLinks: [
                        ...prev.socialLinks,
                        { platform: "", url: "", icon: "" },
                  ],
            }));
      };

      const handleRemoveSocialLink = (index) => {
            setFormData((prev) => ({
                  ...prev,
                  socialLinks: prev.socialLinks.filter((_, i) => i !== index),
            }));
      };

      const handleSocialLinkChange = (index, field, value) => {
            setFormData((prev) => {
                  const updated = [...prev.socialLinks];
                  updated[index] = { ...updated[index], [field]: value };
                  return { ...prev, socialLinks: updated };
            });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();

            const data = new FormData();

            if (formData.contactImage instanceof File) {
                  data.append("contactImage", formData.contactImage);
            }

            data.append("name", formData.name.trim());
            data.append("email", formData.email.trim());
            data.append("mobile", formData.mobile.trim());
            data.append("address", formData.address.trim());
            data.append(
                  "socialLinks",
                  JSON.stringify(formData.socialLinks)
            );

            try {
                  await dispatch(addUpdateContact(data)).unwrap();
                  toast.success("Contact details updated");
                  dispatch(getContactDetails());
            } catch (error) {
                  toast.error(error || "Update failed");
            }
      };

      return (
            <Fragment>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <Card>
                              <CardHeader>
                                    <CardTitle>Current Contact Details</CardTitle>
                              </CardHeader>
                              <CardContent>
                                    {loading ? (
                                          <Skeleton className="h-40 w-full" />
                                    ) : contactDetails ? (
                                          <div className="text-center space-y-2">
                                                {contactDetails.contactImage?.url && (
                                                      <img
                                                            src={contactDetails.contactImage.url}
                                                            className="w-40 h-40 rounded-full mx-auto object-cover"
                                                            alt="Contact"
                                                      />
                                                )}

                                                {contactDetails.name && (
                                                      <div className="flex justify-center gap-2">
                                                            <UserRound size={16} /> {contactDetails.name}
                                                      </div>
                                                )}

                                                {contactDetails.email && (
                                                      <div className="flex justify-center gap-2 text-sm">
                                                            <Mail size={14} /> {contactDetails.email}
                                                      </div>
                                                )}

                                                {contactDetails.mobile && (
                                                      <div className="flex justify-center gap-2 text-sm">
                                                            <Phone size={14} /> {contactDetails.mobile}
                                                      </div>
                                                )}

                                                {contactDetails.address && (
                                                      <div className="flex justify-center gap-2 text-sm">
                                                            <MapPin size={14} /> {contactDetails.address}
                                                      </div>
                                                )}

                                                {contactDetails.socialLinks?.length > 0 && (
                                                      <div className="mt-4 space-y-1">
                                                            <p className="font-semibold text-sm">
                                                                  Social Links
                                                            </p>
                                                            {contactDetails.socialLinks.map((link, i) => (
                                                                  <div key={i} className="text-xs">
                                                                        {link.platform} — {link.url}
                                                                  </div>
                                                            ))}
                                                      </div>
                                                )}
                                          </div>
                                    ) : (
                                          <p className="text-center text-muted-foreground">
                                                No contact details found
                                          </p>
                                    )}
                              </CardContent>
                        </Card>
                        <Card>
                              <CardHeader>
                                    <CardTitle>Update Contact Details</CardTitle>
                              </CardHeader>
                              <CardContent>
                                    {loading ? (
                                          <Skeleton className="h-40 w-full" />
                                    ) : (
                                          <>
                                                <CommonForm
                                                      formControls={adminContactFormIndex}
                                                      values={formData}
                                                      onChange={handleChange}
                                                      onSubmit={handleSubmit}
                                                      buttonText="Save Changes"
                                                      isLoading={loading}
                                                />
                                                <div className="mt-6 space-y-4">
                                                      <div className="flex justify-between items-center">
                                                            <Label className="font-semibold">
                                                                  Social Links
                                                            </Label>
                                                            <Button
                                                                  type="button"
                                                                  size="sm"
                                                                  variant="outline"
                                                                  onClick={handleAddSocialLink}
                                                            >
                                                                  <Plus size={14} className="mr-1" />
                                                                  Add Link
                                                            </Button>
                                                      </div>

                                                      {formData.socialLinks.map((link, index) => (
                                                            <Card key={index} className="p-4 space-y-3">
                                                                  <div className="flex justify-between items-center">
                                                                        <span className="text-sm">
                                                                              Link {index + 1}
                                                                        </span>
                                                                        <Button
                                                                              type="button"
                                                                              size="sm"
                                                                              variant="destructive"
                                                                              onClick={() =>
                                                                                    handleRemoveSocialLink(index)
                                                                              }
                                                                        >
                                                                              <Trash2 size={14} />
                                                                        </Button>
                                                                  </div>

                                                                  <div className="space-y-2">
                                                                        <div>
                                                                              <Label>Platform</Label>
                                                                              <Input
                                                                                    value={link.platform}
                                                                                    onChange={(e) =>
                                                                                          handleSocialLinkChange(
                                                                                                index,
                                                                                                "platform",
                                                                                                e.target.value
                                                                                          )
                                                                                    }
                                                                              />
                                                                        </div>

                                                                        <div>
                                                                              <Label>URL</Label>
                                                                              <Input
                                                                                    value={link.url}
                                                                                    onChange={(e) =>
                                                                                          handleSocialLinkChange(
                                                                                                index,
                                                                                                "url",
                                                                                                e.target.value
                                                                                          )
                                                                                    }
                                                                              />
                                                                        </div>

                                                                        <div>
                                                                              <Label>Icon</Label>
                                                                              <Input
                                                                                    value={link.icon}
                                                                                    onChange={(e) =>
                                                                                          handleSocialLinkChange(
                                                                                                index,
                                                                                                "icon",
                                                                                                e.target.value
                                                                                          )
                                                                                    }
                                                                              />
                                                                        </div>
                                                                  </div>
                                                            </Card>
                                                      ))}
                                                </div>
                                          </>
                                    )}
                              </CardContent>
                        </Card>
                  </div>
            </Fragment>
      );
};

export default AdminViewContactDetails;
