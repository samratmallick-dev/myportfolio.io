import serviceService from "../service/service.service.js";
import { sendSuccess, sendCreated } from "../utilities/response/apiResponse.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";
import { broadcastPortfolioUpdate } from "../config/socket/socket.config.js";

class ServiceController {
      createService = asyncHandler(async (req, res) => {
            const serviceData = req.body;
            const service = await serviceService.createService(serviceData);
            const allServices = await serviceService.getAllServices();
            broadcastPortfolioUpdate("services", allServices);
            sendCreated(res, "Service created successfully", service);
      });

      getAllServices = asyncHandler(async (req, res) => {
            const services = await serviceService.getAllServices();
            sendSuccess(res, "Services retrieved successfully", services);
      });

      getServiceById = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const service = await serviceService.getServiceById(id);
            sendSuccess(res, "Service retrieved successfully", service);
      });

      updateService = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const serviceData = req.body;
            const service = await serviceService.updateService(id, serviceData);
            const allServices = await serviceService.getAllServices();
            broadcastPortfolioUpdate("services", allServices);
            sendSuccess(res, "Service updated successfully", service);
      });

      deleteService = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const result = await serviceService.deleteService(id);
            const allServices = await serviceService.getAllServices();
            broadcastPortfolioUpdate("services", allServices);
            sendSuccess(res, "Service deleted successfully", result);
      });

      getAllServicesAdmin = asyncHandler(async (req, res) => {
            const services = await serviceService.getAllServicesAdmin();
            sendSuccess(res, "All services retrieved successfully", services);
      });
};

export default new ServiceController();


