import React, { Fragment, useEffect, useMemo, useState } from 'react';
import CommonForm from '@/components/common/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { adminProjectFormIndex } from '@/config/allFormIndex';
import { Input } from '@/components/ui/input';
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
      description: '',
      technologies: '',
      githubUrl: '',
      liveUrl: '',
      status: 'Completed',
};

const AdminViewProject = () => {
      const dispatch = useDispatch();
      const { projectsData, featuredProjects, isLoading, error, success } = useSelector((state) => state.project);

      const [formData, setFormData] = useState(initialFormData);
      const [editMode, setEditMode] = useState(false);
      const [editId, setEditId] = useState(null);
      const [selectedFeatured, setSelectedFeatured] = useState([]);

      useEffect(() => {
            dispatch(getAllProjectsAdmin());
            dispatch(getFeaturedProjects());
      }, [dispatch]);

      useEffect(() => {
            if (featuredProjects && Array.isArray(featuredProjects)) {
                  setSelectedFeatured(featuredProjects.map((p) => p._id));
            }
      }, [featuredProjects]);

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
      }, [success, error, dispatch, editMode]);

      const handleChange = (name, value) => {
            setFormData((prev) => ({ ...prev, [name]: value }));
      };

      const resetForm = () => {
            setFormData(initialFormData);
            setEditMode(false);
            setEditId(null);
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            const payload = {
                  title: formData.title,
                  description: formData.description,
                  technologies: formData.technologies,
                  githubUrl: formData.githubUrl,
                  liveUrl: formData.liveUrl,
                  status: formData.status,
            };

            if (editMode) {
                  dispatch(updateProjectData({ id: editId, projectData: payload }));
            } else {
                  dispatch(createProjectData(payload));
            }
      };

      const handleEdit = (item) => {
            setEditMode(true);
            setEditId(item._id);
            setFormData({
                  title: item.title || '',
                  description: item.description || '',
                  technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : (item.technologies || ''),
                  githubUrl: item.githubUrl || '',
                  liveUrl: item.liveUrl || '',
                  status: item.status || 'Completed',
            });
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
                                                                        <div className="font-bold">{item.title}</div>
                                                                        <div className="text-sm text-muted-foreground">{item.status}</div>
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
                                                                              className={'hover:bg-primary/60 text-muted-foreground hover:text-white transition-colors duration-300 ease-out'}
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
                                    <Button onClick={saveFeatured} disabled={isLoading} className="ml-auto hero-gradient text-muted hover:opacity-90">Save Featured</Button>
                              </div>
                        </div>
                        <div>
                              <Card>
                                    <CardHeader>
                                          <CardTitle>{editMode ? 'Update Project' : 'Add Project'}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
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
