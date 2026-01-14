import serviceRepository from "../repository/service.repository.js";
import ApiError from "../utilities/error/apiError.js";
import Logger from "../config/logger/logger.config.js";

class ServiceService {
      async createService(serviceData) {
            Logger.info('Creating new service', { title: serviceData.title });
            if (serviceData.features && typeof serviceData.features === 'string') {
                  serviceData.features = serviceData.features.split(',').map(f => f.trim());
            }

            const service = await serviceRepository.create(serviceData);
            Logger.info('Service created successfully', { serviceId: service._id });
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
            Logger.info('Deleting service', { serviceId: id });
            const service = await serviceRepository.findById(id);

            if (!service) {
                  Logger.error('Service deletion failed - not found', { serviceId: id });
                  throw ApiError.notFound("Service not found");
            }

            await serviceRepository.deleteById(id);
            Logger.info('Service deleted successfully', { serviceId: id });
            return { message: "Service deleted successfully" };
      }

      async getAllServicesAdmin() {
            const services = await serviceRepository.findAll();
            return services;
      }
}

export default new ServiceService();
