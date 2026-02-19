import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './site.entity';

@Injectable()
export class SitesService {
    constructor(
        @InjectRepository(Site)
        private sitesRepository: Repository<Site>,
    ) { }

    findAll(): Promise<Site[]> {
        return this.sitesRepository.find();
    }

    findOne(id: string): Promise<Site | null> {
        return this.sitesRepository.findOneBy({ id });
    }

    create(site: Partial<Site>): Promise<Site> {
        const newSite = this.sitesRepository.create(site);
        return this.sitesRepository.save(newSite);
    }

    async remove(id: string): Promise<void> {
        await this.sitesRepository.delete(id);
    }
}
