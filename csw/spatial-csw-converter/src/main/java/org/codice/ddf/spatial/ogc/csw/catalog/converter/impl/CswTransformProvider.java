/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
package org.codice.ddf.spatial.ogc.csw.catalog.converter.impl;

import com.thoughtworks.xstream.converters.Converter;
import com.thoughtworks.xstream.converters.MarshallingContext;
import com.thoughtworks.xstream.converters.UnmarshallingContext;
import com.thoughtworks.xstream.io.HierarchicalStreamReader;
import com.thoughtworks.xstream.io.HierarchicalStreamWriter;
import com.thoughtworks.xstream.io.copy.HierarchicalStreamCopier;
import com.thoughtworks.xstream.io.xml.PrettyPrintWriter;
import com.thoughtworks.xstream.io.xml.XppReader;
import com.thoughtworks.xstream.io.xml.xppdom.XppFactory;
import ddf.catalog.data.BinaryContent;
import ddf.catalog.data.Metacard;
import ddf.catalog.transform.CatalogTransformerException;
import ddf.catalog.transform.InputTransformer;
import ddf.catalog.transform.MetacardTransformer;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.codice.ddf.spatial.ogc.csw.catalog.common.CswConstants;
import org.codice.ddf.spatial.ogc.csw.catalog.transformer.TransformerManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Serializable;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * This class maintains a list of the available MetacardTransformers for mime types text/xml and application/xml.
 */
public class CswTransformProvider implements Converter {

    private static final Logger LOGGER = LoggerFactory
            .getLogger(CswTransformProvider.class);

    private final TransformerManager<MetacardTransformer> transformerManager;
    private final TransformerManager<InputTransformer> inputTransformerManager;

    public CswTransformProvider(
            TransformerManager<MetacardTransformer> transformerManager,
            TransformerManager<InputTransformer> inputTransformerManager) {
        this.transformerManager = transformerManager;
        this.inputTransformerManager = inputTransformerManager;
    }

    @Override public void marshal(Object o, HierarchicalStreamWriter writer,
            MarshallingContext context) {
        if (o == null) {
            return;
        }
        Metacard metacard = (Metacard) o;
        Object arg = context.get(CswConstants.OUTPUT_SCHEMA_PARAMETER);
        MetacardTransformer transformer = null;

        if (arg != null && StringUtils.isNotBlank((String) arg)) {
            String outputSchema = (String) arg;
            transformer = transformerManager.getTransformerBySchema(outputSchema);
        } else {
            transformer = transformerManager.getTransformerBySchema(CswConstants.CSW_OUTPUT_SCHEMA);
        }

        if (transformer == null) {
            // TODO - throw or just return?
            return;
        }

        BinaryContent content = null;
        try {
            content = transformer.transform(metacard, getArguments(context));
        } catch (CatalogTransformerException e) {
            // TODO - throw or return??
            return;
        }

        writeXml(content, writer);
    }

    private void writeXml(BinaryContent content, HierarchicalStreamWriter writer) {
        try {
            XmlPullParser parser = XppFactory.createDefaultParser();
            new HierarchicalStreamCopier()
                    .copy(new XppReader(new InputStreamReader(content.getInputStream()), parser),
                            writer);
        } catch (XmlPullParserException e) {
            LOGGER.error("Unable to copy metadata to XML Output.", e);
        }

    }

    private Map<String, Serializable> getArguments(MarshallingContext context) {
        Map<String, Serializable> arguments = new HashMap<>();
        Iterator<Object> contextIterator = context.keys();
        while (contextIterator.hasNext()) {
            Object key = contextIterator.next();
            if (key instanceof String) {
                Object value = context.get(key);
                if (value instanceof Serializable) {
                    arguments.put((String) key, (Serializable) value);
                }
            }
        }
        return arguments;
    }

    @Override public Object unmarshal(HierarchicalStreamReader reader,
            UnmarshallingContext context) {
        // TODO - lookup schema from context properties
        InputTransformer transformer = inputTransformerManager.getTransformerBySchema(
                CswConstants.CSW_OUTPUT_SCHEMA);

        Metacard metacard = null;
        try (InputStream is = readXml(reader, context)) {
            metacard = transformer.transform(is);
        } catch (IOException|CatalogTransformerException e) {
            // TODO - do something here
            return null;
        }
        return metacard;
    }

    private InputStream readXml(HierarchicalStreamReader reader, UnmarshallingContext context) {
        StringWriter stringWriter = new StringWriter();
        PrettyPrintWriter writer = new PrettyPrintWriter(stringWriter);
        new HierarchicalStreamCopier().copy(reader, writer);
        return IOUtils.toInputStream(stringWriter.toString());
    }

    @Override public boolean canConvert(Class clazz) {
        return Metacard.class.isAssignableFrom(clazz);
    }
}
