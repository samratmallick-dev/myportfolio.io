import React, { Fragment, useEffect, useMemo, useCallback, useState } from 'react';
import CommonForm from '@/components/common/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { adminProjectFormIndex } from '@/config/allFormIndex';
import { Input } from '@/components/ui/input';
import { ImagePlus, X } from 'lucide-react';
import {
      createProjectData,
      updateProjectData,
      deleteProjectData,
      getAllProjectsAdmin,
      getFeaturedProjects,
      updateFeaturedProjects,
      clearError,
      clearSuccess,
} from '@/store/project.slice';

const initialFormData = {
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      category: '',
      year: '',
      technologies: '',
      features: '',
      architecture: '',
      process: '',
      challenges: '',
      results: '',
      githubUrl: '',
      liveUrl: '',
      order: 0,
      status: 'Completed',
};

const AdminViewProject = () => {
      const dispatch = useDispatch();
      const { projectsData, featuredProjects, isLoading, error, success } = useSelector((state) => state.project);

      const [formData, setFormData] = useState(initialFormData);
      const [editMode, setEditMode] = useState(false);
      const [editId, setEditId] = useState(null);
      const [selectedFeatured, setSelectedFeatured] = useState([]);
      // Image upload state
      const [imageFile, setImageFile] = useState(null);
      const [imagePreview, setImagePreview] = useState(null);

      useEffect(() => {
            dispatch(getAllProjectsAdmin());
            dispatch(getFeaturedProjects());
      }, [dispatch]);

      useEffect(() => {
            if (featuredProjects && Array.isArray(featuredProjects)) {
                  setSelectedFeatured(featuredProjects.map((p) => p._id));
            }
      }, [featuredProjects]);

      const handleChange = (name, value) => {
            setFormData((prev) => ({ ...prev, [name]: value }));
      };

      const handleImageChange = (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
      };

      const clearImage = useCallback(() => {
            setImageFile(null);
            setImagePreview(null);
      }, []);

      const resetForm = useCallback(() => {
            setFormData(initialFormData);
            setEditMode(false);
            setEditId(null);
            clearImage();
      }, [clearImage]);

      // Declared after resetForm so the hook dependency list is complete.
      useEffect(() => {
            if (success) {
                  toast.success(editMode ? 'Project updated successfully!' : 'Project created successfully!');
                  dispatch(clearSuccess());
                  resetForm();
            }
            if (error) {
                  toast.error(error?.message || 'Failed to save project.');
                  dispatch(clearError());
            }
      }, [success, error, dispatch, editMode, resetForm]);

      const parseCommaSeparated = (str) => {
            if (!str) return [];
            return str.split(',').map(s => s.trim()).filter(Boolean);
      };

      const handleSubmit = async (e) => {
            e.preventDefault();

            // Build multipart FormData
            const fd = new FormData();
            fd.append('title', formData.title);
            if (formData.slug) fd.append('slug', formData.slug);
            fd.append('shortDescription', formData.shortDescription || '');
            fd.append('description', formData.description);
            fd.append('category', formData.category || '');
            if (formData.year) fd.append('year', formData.year);
            fd.append('technologies', formData.technologies || '');
            // Arrays: send as JSON strings so backend can parse
            fd.append('features', JSON.stringify(parseCommaSeparated(formData.features)));
            fd.append('architecture', JSON.stringify(parseCommaSeparated(formData.architecture)));
            fd.append('process', JSON.stringify(parseCommaSeparated(formData.process)));
            fd.append('challenges', JSON.stringify(parseCommaSeparated(formData.challenges)));
            fd.append('results', JSON.stringify(parseCommaSeparated(formData.results)));
            fd.append('githubUrl', formData.githubUrl || '');
            fd.append('liveUrl', formData.liveUrl || '');
            fd.append('order', formData.order ? Number(formData.order) : 0);
            fd.append('status', formData.status || 'Completed');
            if (imageFile) {
                  fd.append('image', imageFile);
            }

            if (editMode) {
                  dispatch(updateProjectData({ id: editId, projectData: fd }));
            } else {
                  dispatch(createProjectData(fd));
            }
      };

      const handleEdit = (item) => {
            setEditMode(true);
            setEditId(item._id);
            setFormData({
                  title: item.title || '',
                  slug: item.slug || '',
                  shortDescription: item.shortDescription || '',
                  description: item.description || '',
                  category: item.category || '',
                  year: item.year || '',
                  technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : (item.technologies || ''),
                  features: Array.isArray(item.features) ? item.features.join(', ') : '',
                  architecture: Array.isArray(item.architecture) ? item.architecture.join(', ') : '',
                  process: Array.isArray(item.process) ? item.process.join(', ') : '',
                  challenges: Array.isArray(item.challenges) ? item.challenges.join(', ') : '',
                  results: Array.isArray(item.results) ? item.results.join(', ') : '',
                  githubUrl: item.githubUrl || '',
                  liveUrl: item.liveUrl || '',
                  order: item.order || 0,
                  status: item.status || 'Completed',
            });
            // Show existing image as preview
            if (item.image?.url) {
                  setImagePreview(item.image.url);
            } else {
                  setImagePreview(null);
            }
            setImageFile(null);
      };

      const handleDelete = async (id) => {
            if (window.confirm('Are you sure you want to delete this project?')) {
                  dispatch(deleteProjectData(id));
            }
      };

      const toggleFeatured = (projectId) => {
            setSelectedFeatured((prev) => {
                  const has = prev.includes(projectId);
                  if (has) {
                        return prev.filter((id) => id !== projectId);
                  }
                  if (prev.length >= 3) {
                        toast.error('You can select at most 3 featured projects.');
                        return prev;
                  }
                  return [...prev, projectId];
            });
      };

      const saveFeatured = async () => {
            try {
                  await dispatch(updateFeaturedProjects(selectedFeatured)).unwrap();
                  toast.success('Featured projects updated!');
            } catch (err) {
                  toast.error(err?.message || 'Failed to update featured projects.');
            }
      };

      const isProjectFeatured = useMemo(() => new Set(selectedFeatured), [selectedFeatured]);

      const technologiesArray = (tech) => {
            if (!tech) return [];
            if (Array.isArray(tech)) return tech;
            if (typeof tech !== 'string') return [];
            return tech.split(',').map(t => t.trim()).filter(Boolean);
      };

      return (
            <Fragment>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="space-y-6">
                              <Card>
                                    <CardHeader>
                                          <CardTitle>Projects List</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                          {isLoading && !projectsData.length ? (
                                                <div className="space-y-4">
                                                      <Skeleton className="h-10 w-full" />
                                                      <Skeleton className="h-24 w-full" />
                                                      <Skeleton className="h-10 w-32" />
                                                </div>
                                          ) : projectsData.length > 0 ? (
                                                <ul className="space-y-4">
                                                      {projectsData.map((item) => (
                                                            <li key={item._id} className="p-4 border rounded-md space-y-2">
                                                                  <div className="flex items-center justify-between gap-4">
                                                                        <div className="flex items-center gap-3">
                                                                              {item.image?.url && (
                                                                                    <img
                                                                                          src={item.image.url}
                                                                                          alt={item.title}
                                                                                          className="w-10 h-10 rounded object-cover border border-border flex-shrink-0"
                                                                                    />
                                                                              )}
                                                                              <div className="font-bold">{item.title}</div>
                                                                        </div>
                                                                        <Badge variant="outline" className={item.status === 'Completed' ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'}>
                                                                              {item.status}
                                                                        </Badge>
                                                                  </div>
                                                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                                                  {item.technologies && technologiesArray(item.technologies).length > 0 && (
                                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                                              {technologiesArray(item.technologies).map((t, idx) => (
                                                                                    <span key={idx} className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20">{t}</span>
                                                                              ))}
                                                                        </div>
                                                                  )}
                                                                  <div className="flex flex-wrap gap-2 mt-3">
                                                                        <Button
                                                                              variant={'outline'}
                                                                              className={'hover:bg-primary hover:text-primary-foreground transition-colors duration-300 ease-out'}
                                                                              onClick={() => handleEdit(item)}
                                                                        >
                                                                              Edit
                                                                        </Button>
                                                                        <Button
                                                                              variant={'destructive'}
                                                                              onClick={() => handleDelete(item._id)}
                                                                        >
                                                                              Delete
                                                                        </Button>
                                                                        <div className="ml-auto inline-flex items-center gap-2 text-sm">
                                                                              <Input
                                                                                    id={`featured-${item._id}`}
                                                                                    type="checkbox"
                                                                                    checked={isProjectFeatured.has(item._id)}
                                                                                    onChange={() => toggleFeatured(item._id)}
                                                                                    name={`featured-${item._id}`}
                                                                              />
                                                                              <Label htmlFor={`featured-${item._id}`}>Featured</Label>
                                                                        </div>
                                                                  </div>
                                                            </li>
                                                      ))}
                                                </ul>
                                          ) : (
                                                <div className="text-center p-8 text-muted-foreground">
                                                      <p>No projects found.</p>
                                                </div>
                                          )}
                                    </CardContent>
                              </Card>
                              <div className="flex items-center gap-4">
                                    <div className="text-sm text-muted-foreground">Selected Featured: {selectedFeatured.length} / 3</div>
                                    <Button onClick={saveFeatured} disabled={isLoading} className="ml-auto hero-gradient text-on-gradient hover:opacity-90">Save Featured</Button>
                              </div>
                        </div>
                        <div>
                              <Card>
                                    <CardHeader>
                                          <CardTitle>{editMode ? 'Update Project' : 'Add Project'}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                          {/* Image Upload Section */}
                                          <div className="mb-6">
                                                <Label className="block mb-2 font-medium">Project Image</Label>
                                                {imagePreview ? (
                                                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border group">
                                                            <img
                                                                  src={imagePreview}
                                                                  alt="Project preview"
                                                                  className="w-full h-full object-cover"
                                                            />
                                                            <button
                                                                  type="button"
                                                                  onClick={clearImage}
                                                                  className="absolute top-2 right-2 p-1 rounded-full bg-overlay/70 text-on-gradient hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                                            >
                                                                  <X className="w-4 h-4" />
                                                            </button>
                                                      </div>
                                                ) : (
                                                      <label
                                                            htmlFor="project-image-upload"
                                                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                                      >
                                                            <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                                                            <p className="text-sm text-muted-foreground">Click to upload project image</p>
                                                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p>
                                                      </label>
                                                )}
                                                <input
                                                      id="project-image-upload"
                                                      type="file"
                                                      accept="image/*"
                                                      className="hidden"
                                                      onChange={handleImageChange}
                                                />
                                          </div>

                                          <CommonForm
                                                formControls={adminProjectFormIndex}
                                                buttonText={editMode ? 'Update Project' : 'Add Project'}
                                                onSubmit={handleSubmit}
                                                values={formData}
                                                onChange={handleChange}
                                                isLoading={isLoading}
                                          />
                                          {editMode && (
                                                <Button variant="destructive" onClick={resetForm} className="mt-4 w-full">Cancel Edit</Button>
                                          )}
                                    </CardContent>
                              </Card>
                        </div>
                  </div>
            </Fragment>
      );
};

export default AdminViewProject;
