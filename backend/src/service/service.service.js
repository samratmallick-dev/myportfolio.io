import serviceRepository from "../repository/service.repository.js";
import ApiError from "../utilities/error/apiError.js";

class ServiceService {
      async createService(serviceData) {
            if (serviceData.features && typeof serviceData.features === 'string') {
                  serviceData.features = serviceData.features.split(',').map(f => f.trim());
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

      async updateService(id, serviceData) {
            const existingService = await serviceRepository.findById(id);

            if (!existingService) {
                  throw ApiError.notFound("Service not found");
            }

            if (serviceData.features && typeof serviceData.features === 'string') {
                  serviceData.features = serviceData.features.split(',').map(f => f.trim());
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
