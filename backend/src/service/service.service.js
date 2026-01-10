import serviceRepository from "../repository/service.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { uploadToCloudinary } from "../utilities/cloudinary/upload.js";

class ServiceService {
  async createService(serviceData, icon) {
    if (icon) {
      const cloudinaryResponse = await uploadToCloudinary(icon, "services/icons");
      serviceData.icon = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    }

    const service = await serviceRepository.create(serviceData);
    return service;
  }

  async getAllServices() {
    const services = await serviceRepository.findActive();
    return services;
  }

  async getServiceById(id) {
    const service = await serviceRepository.findById(id);
    
    if (!service) {
      throw ApiError.notFound("Service not found");
    }

    if (!service.isActive) {
      throw ApiError.badRequest("Service is not active");
    }

    return service;
  }

  async updateService(id, serviceData, icon) {
    const existingService = await serviceRepository.findById(id);
    
    if (!existingService) {
      throw ApiError.notFound("Service not found");
    }

    if (icon) {
      const cloudinaryResponse = await uploadToCloudinary(icon, "services/icons");
      serviceData.icon = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    }

    const updatedService = await serviceRepository.updateById(id, serviceData);
    return updatedService;
  }

  async deleteService(id) {
    const service = await serviceRepository.findById(id);
    
    if (!service) {
      throw ApiError.notFound("Service not found");
    }

    await serviceRepository.deleteById(id);
    return { message: "Service deleted successfully" };
  }

  async getAllServicesAdmin() {
    const services = await serviceRepository.findAll();
    return services;
  }
}

export default new ServiceService();
