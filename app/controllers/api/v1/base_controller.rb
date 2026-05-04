module Api
  module V1
    class BaseController < ApplicationController
      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActiveRecord::RecordInvalid, with: :render_validation_errors

      private

      def render_not_found(exception)
        render json: { errors: [ { code: "not_found", message: exception.message } ] },
                status: :not_found
      end

      def render_validation_errors(exception)
        errors = exception.record.errors.map do |error|
          { code: "validation_error", field: error.attribute, message: error.full_message }
        end
        render json: { errors: errors }, status: :unprocessable_entity
      end
    end
  end
end
